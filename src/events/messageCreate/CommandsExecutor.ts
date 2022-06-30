import { Message, MessageEmbed } from 'discord.js';

import CommandSource from '../../structures/commands/CommandSource';
import { Colors, Symbols } from '../../utils/Constants';
import { sendTemporal, canMemberExecute, getMessageOptions } from '../../utils/DiscordUtils';
import { getCommandName } from '../../utils/CommandUtils';
import Event from '../../structures/Event';
import MessageArgumentsParser from '../../MessageArgumentsParser';
import { split } from '../../utils/StringUtils';
import Command from '../../structures/commands/Command';
import { SubclassConstructor } from '../../structures/types';

export default class CommandsExecutor extends Event {
  override async run(message: Message) {
    const parsedMessage = getCommandName(message, this.bot.options.prefixes);

    const commands = this.bot.commands.getCommands();
    if (!parsedMessage.isCommand) return;

    const CommandClass = commands.get(parsedMessage.name as string) as unknown as SubclassConstructor<typeof Command>;
    if (!CommandClass) return;

    const source = new CommandSource(message);
    const missingPerms = canMemberExecute(message.member, CommandClass.data);
    if (!missingPerms.canExecute) {
      const errorResponse = new MessageEmbed()
        .setTitle(`${Symbols.ERROR} Error`)
        .setDescription(`You cannot execute this command: **${missingPerms.reason}**`)
        .setColor(Colors.RED);
      if (missingPerms.missingPerms?.length) {
        errorResponse.addField('Missing permissions', `
\`\`\`
${missingPerms.missingPerms}
\`\`\`
`);
      }
      await sendTemporal(source, { content: `<@${message.author.id}>`, embeds: [errorResponse] });
      return;
    }
    if (!parsedMessage.prefix || !parsedMessage.name || !parsedMessage.args) return;

    const MessageArgsParser = new MessageArgumentsParser(
      source.getRaw() as Message<true>,
      split((source.getRaw() as Message<true>).content.substring(parsedMessage.prefix.length + parsedMessage.name.length)),
      CommandClass,
      CommandClass.getOptions(),
    );

    const optionResolver = await MessageArgsParser.process();
    if (!optionResolver) {
      await message.reply(getMessageOptions(CommandClass.data, source, CommandClass.getUsage(parsedMessage.prefix as string)));
      return;
    }

    const cmd = new CommandClass(
      this.bot,
      parsedMessage.name,
      source,
      parsedMessage.prefix,
      optionResolver,
    );
    await cmd.execute();
  }
}
