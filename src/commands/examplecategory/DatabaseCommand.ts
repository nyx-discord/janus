import { CommandData } from '../../structures/types';
import SubcommandableCommand from '../../structures/commands/SubcommandableCommand';
import DatabaseGetSubcommand from './databaseSubcommands/DatabaseGetSubcommand';
import DatabaseSetSubcommand from './databaseSubcommands/DatabaseSetSubcommand';

export default class DatabaseCommand extends SubcommandableCommand {
  static override data: CommandData = {
    names: ['database'],
    description: 'Example of a command using prisma\'s database system.',
    defaultColor: 0x3db06f,
  };

  static override getSubCommands() {
    return [DatabaseGetSubcommand, DatabaseSetSubcommand];
  }
}
