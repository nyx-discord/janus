import { ApplicationCommandOptionData } from 'discord.js';

import SubCommand from '../../../structures/commands/SubCommand';
import { CommandData } from '../../../structures/types';

export default class DatabaseSetSubcommand extends SubCommand {
  static override data: CommandData = {
    names: ['set'],
    description: 'Set your name on the database',
    defaultColor: 0xbd2d2d,
    usage: '<name>',
  };

  override async execute() {
    const name = this.options.getString('name');
    if (!name) return this.sendUsage();

    const { id } = this.source.getUser();
    const existingUser = await this.bot.prisma.user.findUnique({ where: { id } });
    if (!existingUser) await this.bot.prisma.user.create({ data: { id, name } });

    await this.bot.prisma.user.update({ where: { id }, data: { name } });
    return this.reply(`Updated name to \`${name}\`!`);
  }

  static override getOptions(): ApplicationCommandOptionData[] {
    return [
      {
        name: 'name',
        type: 'STRING',
        description: 'Your name to set on the database',
        required: true,
      },
    ];
  }
}
