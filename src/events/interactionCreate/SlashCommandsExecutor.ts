import { GuildMember, Interaction, MessageEmbed } from 'discord.js';

import CommandSource from '../../structures/commands/CommandSource';
import { Symbols, Colors } from '../../utils/Constants';
import { sendTemporal, canMemberExecute } from '../../utils/DiscordUtils';
import Command from '../../structures/commands/Command';
import Event from '../../structures/Event';

export default class SlashCommandsExecutor extends Event {
  override async run(interaction: Interaction): Promise<void> {
    if (!interaction.isCommand() && !interaction.isContextMenu()) return;

    const name = interaction.commandName;
    const CommandClass = this.bot.commands.getCommands().get(name) as typeof Command;

    if (CommandClass === undefined) return;

    const missingPerms = canMemberExecute(interaction.member as GuildMember | null, CommandClass.data);
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
      await sendTemporal(interaction, { content: `<@${interaction.user.id}>`, embeds: [errorResponse] });
      return;
    }
    const source = new CommandSource(interaction);

    // FIXME The type is somehow wrong here, CommandClass appears as AbstractCommand, when it's actually a subclass of it.
    // @ts-ignore See above
    const cmd = new CommandClass(this.bot, name, source, '/', interaction.options);
    await cmd.execute();
  }
}
