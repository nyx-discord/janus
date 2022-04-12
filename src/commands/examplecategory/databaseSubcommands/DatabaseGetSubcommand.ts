import SubCommand from '../../../structures/commands/SubCommand';
import { CommandData } from '../../../structures/types';

export default class DatabaseGetSubcommand extends SubCommand {
  static override data: CommandData = {
    names: ['get'],
    description: 'Get your name on the database.',
    defaultColor: 0xf5e71e,
  };

  override async execute() {
    const { id } = this.source.getUser();
    const savedUser = await this.bot.prisma.user.findUnique({ where: { id } });
    if (!savedUser) return this.reply('No name saved yet!');

    return this.reply(`Your name is \`${savedUser.name}\``);
  }
}
