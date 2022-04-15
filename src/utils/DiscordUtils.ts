import {
  Channel,
  ChannelManager,
  Client,
  CommandInteraction,
  Constants,
  ContextMenuInteraction,
  DiscordAPIError,
  Guild,
  GuildMember,
  GuildMemberManager,
  InteractionReplyOptions,
  Message,
  MessageActionRow,
  MessageAttachment,
  MessageEmbed,
  MessageOptions,
  ReplyMessageOptions,
  Role,
  RoleManager,
  Snowflake,
  User,
  UserManager,
  Util,
} from 'discord.js';
import { BaseOptions, CommandData, ProcessedPermission } from '../structures/types';
import CommandSource from '../structures/commands/CommandSource';

const SnowflakeRegexes = new Map([
  ['user', /^<@!?(\d+)>$/],
  ['role', /^<@&(\d+)>$/],
  ['channel', /^<#(\d+)>$/],
]);

const snowflakeRegex = /^\d+$/;

export async function sendTemporal(
  reference: CommandInteraction | Message | ContextMenuInteraction,
  options: MessageOptions | InteractionReplyOptions,
) {
  const messageOptions = options;
  (messageOptions as InteractionReplyOptions).ephemeral = true;
  const temporalMessage = await reference.reply(messageOptions);
  if (!temporalMessage) return;

  setTimeout(async () => temporalMessage.delete(), 5000);
}

/** Check if the specified GuildMember can execute the command based on its CommandData */
export function canMemberExecute(member: GuildMember | null, data: CommandData): ProcessedPermission {
  const processedUser: ProcessedPermission = {
    canExecute: false,
    reason: '',
    missingPerms: [],
  };

  if (!member && (data.guildOnly || data.userPerms)) {
    processedUser.reason = 'You can only use this command inside a server.';
    return processedUser;
  }

  if (member && data.userPerms) {
    data.userPerms.forEach((perm) => {
      if (!member.permissions.has(perm)) processedUser.missingPerms?.push(perm);
    });

    if (processedUser.missingPerms?.length) {
      processedUser.reason = 'You don\'t have enough permissions to use this command.';
    }
  }

  processedUser.canExecute = true;

  return processedUser;
}

/** Utility to get the MessageOptions from the message and additions specified */
export function getMessageOptions(
  data: CommandData,
  source: CommandSource,
  message: BaseOptions,
  ...additions: Array<MessageEmbed | MessageAttachment | MessageActionRow>
): MessageOptions {
  let options: MessageOptions | ReplyMessageOptions | InteractionReplyOptions = {};

  if (typeof message === 'string') {
    options.content = message;
  } else if (message instanceof MessageEmbed || message instanceof MessageAttachment || message instanceof MessageActionRow) {
    if (message instanceof MessageEmbed) {
      if (!message.color) message.setColor(Util.resolveColor(data.defaultColor));
      if (!message.footer) {
        message.setFooter(
          {
            text: `Executed by ${Util.escapeMarkdown(source.getUser().tag)}`,
            iconURL: source.getUser().avatarURL() as string,
          },
        );
      }
      message.setTimestamp();
    }
    additions.unshift(message);
  } else if (typeof message === 'object') {
    options = message as MessageOptions;
  }

  options.embeds ??= [];
  options.embeds = options.embeds.concat((additions as MessageEmbed[]).filter((a) => a instanceof MessageEmbed));

  options.files ??= [];
  options.files = options.files.concat((additions as MessageAttachment[]).filter((a) => a instanceof MessageAttachment));

  options.components ??= [];
  options.components = options.components.concat((additions as MessageActionRow[]).filter((a) => a instanceof MessageActionRow));
  if (data.ephemeral) {
    (options as InteractionReplyOptions).ephemeral ??= true;
  }

  if (!source.isInteraction) {
    (options as ReplyMessageOptions).failIfNotExists ??= false;
    (options as ReplyMessageOptions).allowedMentions ??= { repliedUser: false };
  }
  return options;
}

/** Parse a possible mention to Snowflake or null if no mention found */
export function mentionToSnowflake(input: string | Snowflake, type: 'user' | 'role' | 'channel'): Snowflake | null {
  if (!input) return null;
  if (snowflakeRegex.test(input)) return input;

  const regex = SnowflakeRegexes.get(type);
  if (!regex) throw new Error('Invalid type to snowflake');
  if (!regex.test(input)) return null;

  return (input.match(regex) as string[])[1];
}

/** Try to fetch the Snowflake specified using the fetch function specified or null if not found */
export async function tryFetch(snowflake: Snowflake, manager: UserManager | GuildMemberManager | ChannelManager | RoleManager) {
  try {
    return await manager.fetch(snowflake);
  } catch (e: unknown) {
    if (!(e instanceof DiscordAPIError) || e.code === Constants.APIErrors.UNKNOWN_USER || e.httpStatus === 404) return null;
    throw e;
  }
}

/** Parse a possible user mention to a User or null if no mention found */
export async function mentionToUser(input: string | Snowflake | User, client: Client): Promise<User | null> {
  if (input instanceof User) return input;

  const snowflake = mentionToSnowflake(input, 'user');
  if (!snowflake) return null;

  return await tryFetch(snowflake, client.users) as User | null;
}

/** Parse a possible member mention to a Member or null if no mention found */
export async function mentionToMember(input:string | Snowflake | GuildMember, guild: Guild | null): Promise<GuildMember | null> {
  if (!guild) return null;
  if (input instanceof GuildMember) return input;

  const snowflake = mentionToSnowflake(input, 'user');
  if (!snowflake) return null;

  return await tryFetch(snowflake, guild.members) as GuildMember | null;
}

/** Parse a possible channel mention to a Channel or null if no mention found */
export async function mentionToChannel(input:string | Snowflake | Channel, guild: Guild | null): Promise<Channel | null> {
  if (!guild) return null;
  if (input instanceof Channel) return input;

  const snowflake = mentionToSnowflake(input, 'channel');
  if (!snowflake) return null;

  return await tryFetch(snowflake, guild.channels) as Channel | null;
}

/** Parse a possible role mention to a Role or null if no mention found */
export async function mentionToRole(input:string | Snowflake | Role, guild: Guild | null): Promise<Role | null> {
  if (!guild) return null;
  if (input instanceof Role) return input;

  const snowflake = mentionToSnowflake(input, 'role');
  if (!snowflake) return null;

  return await tryFetch(snowflake, guild.roles) as Role | null;
}
