import { CommandData } from '../../structures/types';
import ParentCommand from '../../structures/commands/ParentCommand';
import DatabaseGetSubcommand from './databaseSubcommands/DatabaseGetSubcommand';
import DatabaseSetSubcommand from './databaseSubcommands/DatabaseSetSubcommand';

export default class DatabaseCommand extends ParentCommand {
  static override data: CommandData = {
    names: ['database'],
    description: 'Example of a command using prisma\'s database system.',
    defaultColor: 0x3db06f,
  };

  static override getSubCommands() {
    return [DatabaseGetSubcommand, DatabaseSetSubcommand];
  }
}
