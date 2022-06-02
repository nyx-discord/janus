import { ApplicationCommandOptionData, ApplicationCommandType } from 'discord.js';
import { CommandSubclass } from './Command';

/* An Application Command ready to be processed and registered for Discord */
export default class ApplicationCommand {
  /** The type of Application Command */
  public type: ApplicationCommandType;

  /* The name used to register this Application Command */
  public name: string;

  /* The description used to register this Application Command (only for Slash Commands) */
  public description: string | undefined;

  /* The options used to register this Application Command (only for Slash Commands) */
  public options: ApplicationCommandOptionData[] | undefined;

  constructor(command: CommandSubclass, type: ApplicationCommandType) {
    this.type = type;
    [this.name] = command.data.names;
    if (type === 'CHAT_INPUT') {
      this.description = command.data.description;
      this.options = command.getOptions();
    }
  }
}
