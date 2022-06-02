import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  Collection,
  CommandInteractionOption,
  CommandInteractionOptionResolver,
  CommandInteractionResolvedData,
  ExcludeEnum,
  GuildBasedChannel,
  GuildMember,
  Message,
  Role,
  Snowflake,
  TextChannel,
  User,
} from 'discord.js';
import { ChannelTypes } from 'discord.js/typings/enums';

import {
  mentionToUser,
  mentionToMember,
  mentionToChannel,
  mentionToRole,
  resolveChannelType,
} from './utils/DiscordUtils';
import ParentCommand from './structures/commands/ParentCommand';
import SubCommand from './structures/commands/SubCommand';
import { SubclassConstructor } from './structures/types';
import Command from './structures/commands/Command';

// ? An async Array#every (https://advancedweb.hu/how-to-use-async-functions-with-array-some-and-every-in-javascript/)
async function asyncEvery<Type>(arr: Type[], predicate: (input: Type, index: number) => Promise<boolean>) {
  for (const e of arr) {
    // ? We need to await here on purpose so we don't iterate
    // eslint-disable-next-line no-await-in-loop
    if (!await predicate(e, arr.indexOf(e))) return false;
  }
  return true;
}

const truthyValues = ['yes', 'y', '1', 'true', 't'];

export default class MessageArgumentsParser {
  /** The message where this command was called, used to extract context like Client and Guild */
  private readonly message: Message<true>;

  /** The args used to invoke the command  */
  private readonly args: string[];

  /** The original option data, and the expected result at the same time */
  private readonly original: ApplicationCommandOptionData[];

  /** The name of the command */
  private readonly command: SubclassConstructor<typeof Command>;

  constructor(
    message: Message<true>,
    args: string[],
    command: SubclassConstructor<typeof Command>,
    original: ApplicationCommandOptionData[],
  ) {
    this.message = message;
    this.args = args;
    this.command = command;
    this.original = original;
  }

  async process(): Promise<CommandInteractionOptionResolver | false> {
    const { client } = this.message;
    const { guild } = this.message;
    let foundSubcommand = false;

    const optionsResult: CommandInteractionOption[] = [];
    let resolvedResult: CommandInteractionResolvedData;

    const success = await asyncEvery<ApplicationCommandOptionData>(this.original, async (expected, index) => {
      // ? Because of the promises the function sometimes repeats itself, so this check is needed
      // eslint-disable-next-line no-param-reassign
      if (optionsResult[index]) index += 1;

      const input = this.args[index];

      if (!input && 'required' in expected && expected.required) return false;

      const baseOption: CommandInteractionOption = { name: expected.name, type: (expected.type as ApplicationCommandOptionType) };

      switch (expected.type) {
        case 'STRING': {
          if (!(expected.autocomplete) && expected.choices && !expected.choices.map((choice) => choice.name).includes(input)) return false;
          baseOption.value = input;
          optionsResult[index] = (baseOption);
          return true;
        }

        case 'BOOLEAN': {
          baseOption.value = truthyValues.includes(input.toLowerCase());
          optionsResult[index] = (baseOption);
          return true;
        }

        case 'CHANNEL': {
          // ! There might be channels outside guilds? Still need to find an applicable use and how one could mention this in a message
          if (!guild) return false;
          const channel = await mentionToChannel(input, guild);
          const channelTypes: ExcludeEnum<typeof ChannelTypes, 'UNKNOWN'>[] | Exclude<ChannelTypes, ChannelTypes.UNKNOWN>[] | undefined = expected.channelTypes ?? expected.channel_types;
          const channelEnum = Boolean(expected.channel_types && !expected.channelTypes);

          // ? Channel required but no channel found, exit
          if (!channel && (expected.required || expected.channel_types)) return false;

          // ? Channel not required but found, channel types not specified, push
          if (channel && !channelTypes) {
            baseOption.channel = channel as GuildBasedChannel;
            baseOption.value = channel.id;
            optionsResult[index] = baseOption;
            return true;
          }

          // ? Channel found and of types specified, push
          if (channel && channel.type !== 'UNKNOWN' && channelTypes && (channelEnum ? channelTypes.includes(resolveChannelType(channel.type)) : channelTypes.includes(channel.type))) {
            baseOption.channel = channel as GuildBasedChannel;
            baseOption.value = channel.id;
            optionsResult[index] = baseOption;
            return true;
          }

          // ? Channel found but not of types specified, exit
          return false;
        }

        case 'INTEGER': {
          const int = Number.parseInt(input, 10);
          if (Number.isNaN(int) && expected.required) return false;
          baseOption.value = int;
          optionsResult[index] = baseOption;
          return true;
        }

        case 'MENTIONABLE': {
          // ? This is the order Discord.js returns it so ¯\_(ツ)_/¯
          const mentionable = await mentionToMember(input, guild)
            ?? await mentionToUser(input, client)
            ?? await mentionToRole(input, guild)
            ?? null;
          if (!mentionable && expected.required) return false;
          if (mentionable instanceof GuildMember) baseOption.member = mentionable;
          if (mentionable instanceof User) baseOption.user = mentionable;
          if (mentionable instanceof Role) baseOption.role = mentionable;
          baseOption.value = mentionable?.id;

          if (mentionable) optionsResult[index] = baseOption;
          return true;
        }

        case 'NUMBER': {
          const number = Number.parseFloat(input);
          if (Number.isNaN(number) && expected.required) return false;
          baseOption.value = number;
          optionsResult[index] = baseOption;
          return true;
        }

        case 'ROLE': {
          if (!guild) return false;
          const role = await mentionToRole(input, guild);
          if (!role && expected.required) return false;
          if (!role) return true;
          baseOption.role = role as Role;
          baseOption.value = role.id;
          optionsResult[index] = baseOption;
          return true;
        }

        case 'SUB_COMMAND': {
          const SubcommandClass: typeof SubCommand | undefined = (this.command as unknown as typeof ParentCommand)
            .getSubCommands()
            .find((subcommand) => subcommand.data.names.includes(input));
          if (!SubcommandClass) return false;
          const MessageArgsParser = new MessageArgumentsParser(
            this.message,
            this.args.slice(1, this.args.length),
            this.command,
            SubcommandClass.getOptions(),
          );
          const options = await MessageArgsParser.process();
          if (!options) return false;
          baseOption.name = input;
          baseOption.options = [...options.data];
          optionsResult.unshift(baseOption);
          resolvedResult = options.resolved;
          foundSubcommand = true;

          return false;
        }

        case 'USER': {
          const user = await mentionToUser(input, this.message.client);
          if (!user && expected.required) return false;
          if (!user) return true;
          baseOption.user = user as User;
          baseOption.value = user.id;
          if (guild) baseOption.member = await guild.members.fetch(user);
          optionsResult[index] = baseOption;
          return true;
        }

        default: {
          // TODO: Still need an impl for subcommand groups
          return true;
        }
      }
    });

    if (!foundSubcommand) resolvedResult = this.searchForResolved(optionsResult);

    return (success || foundSubcommand)
      // ? Typescript is right about this one, but I haven't found any other good way to achieve this
      // @ts-ignore See above
      ? new CommandInteractionOptionResolver(this.message.client, optionsResult.filter((x) => x !== undefined), resolvedResult)
      : false;
  }

  searchForResolved(options: CommandInteractionOption[]): CommandInteractionResolvedData {
    const resolvedResult: CommandInteractionResolvedData = {};
    options.forEach((option) => {
      switch (option.type) {
        case 'USER': {
          resolvedResult.users ??= new Collection();
          resolvedResult.users.set(<Snowflake> option.user?.id, <User> option.user);

          if (!this.message.guild) break;
          resolvedResult.members ??= new Collection();
          resolvedResult.members.set(<Snowflake> option.user?.id, <GuildMember> option.member);
          break;
        }

        case 'ROLE': {
          resolvedResult.roles ??= new Collection();
          resolvedResult.roles.set(<Snowflake> option.role?.id, <Role> option.role);
          break;
        }

        case 'CHANNEL': {
          resolvedResult.channels ??= new Collection();
          resolvedResult.channels.set(<Snowflake> option.channel?.id, <TextChannel> option.channel);
          break;
        }

        default: {
          break;
        }
      }
    });
    return resolvedResult;
  }
}
