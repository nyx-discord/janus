import { ApplicationCommandDataResolvable, Collection } from 'discord.js';
import fs from 'fs';

import Command from './structures/commands/Command';
import BotType from './Bot';
import ApplicationCommand from './structures/commands/ApplicationCommand';
import { getApplicationCommands } from './utils/CommandUtils';

export default class CommandManager {
  /** The bot that instanciated this manager */
  private readonly bot: BotType;

  /** Array of all the available command classes */
  private readonly commandClasses: typeof Command[] = [];

  /** Collection of <Category, Commands from that category> */
  private readonly categories: Collection<string, typeof Command[]> = new Collection();

  /** Array of all the available main command names */
  private readonly mainCommands: string[] = [];

  /** Collection of <Command name|alias, Command class> */
  private readonly commands: Collection<string, typeof Command> = new Collection<string, typeof Command>();

  constructor(bot: BotType) {
    this.bot = bot;
  }

  /** Load Commands */
  async init() {
    const folders = fs
      .readdirSync(this.bot.options.commandsPath)
      .filter((folder) => fs.lstatSync(`${this.bot.options.commandsPath}/${folder}`).isDirectory());

    for (const folder of folders) {
      const category = [];
      const dirPath = `${this.bot.options.commandsPath}/${folder}`;
      const files = fs
        .readdirSync(dirPath)
        .filter((filename) => filename.endsWith('.js') && fs.statSync(`${dirPath}/${filename}`).isFile());

      for (const file of files) {
        const path = `${dirPath}/${file}`;
        try {
          // ? Eslint is right about this one, but I haven't found any other good way to achieve this
          // eslint-disable-next-line global-require,import/no-dynamic-require
          const command: typeof Command = require(path).default;
          category.push(command);
          this.mainCommands.push(command.data.names[0]);
          for (const name of command.data.names) {
            if (this.commands.has(name)) this.bot.logger.error(`Two commands registered the name '${name}'.`);
            this.commands.set(name, command);
            this.commandClasses.push(command);
          }
        } catch (e) {
          this.bot.logger.error(
            `There was an error while loading the command ${file}\n`,
            e,
          );
        }
      }
      this.categories.set(folder, category);
    }
    this.bot.logger.info(`Loaded ${this.categories.size} categories with ${this.commandClasses.length} commands!`);
    if (this.bot.options.loadApplication) await this.loadApplicationCommands();
  }

  /** Loads ApplicationCommands. */
  private async loadApplicationCommands(): Promise<void> {
    const commands: Collection<string, ApplicationCommand> = getApplicationCommands(this.getCommandClasses());

    const commandManager = this.bot.client.application?.commands;
    if (!commandManager) return;
    await commandManager.set(Array.from(commands.values()) as ApplicationCommandDataResolvable[]);

    this.bot.logger.info('Application Commands loaded to Discord!');
  }

  /** Get the array of all the available command classes */
  getCommandClasses() {
    return this.commandClasses;
  }

  /** Get the collection of <Category, Commands from that category> */
  getCategories(): Collection<string, typeof Command[]> {
    return this.categories;
  }

  /** Get the collection of <Command name|alias, Command class> */
  getCommands(): Collection<string, typeof Command> {
    return this.commands;
  }

  /** Get the array of all the available main command names */
  getMainCommands() {
    return this.mainCommands;
  }
}
