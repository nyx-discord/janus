import {
  Message,
  MessageEmbed,
  CommandInteractionOptionResolver,
} from 'discord.js';

import AbstractCommand from './AbstractCommand';

import CommandSource from './CommandSource';
import { split } from '../../utils/StringUtils';

import Bot from '../../Bot';

/* A fully executable Command by the CommandManager */
export default abstract class Command extends AbstractCommand {
  /** The name used when this command was called */
  protected name: string;

  constructor(bot: Bot, name: string, source: CommandSource, prefix: string) {
    super(bot, source, prefix);
    this.name = name;

    if (source.isInteraction) {
      this.options = source.getOptions() as CommandInteractionOptionResolver;
    } else {
      const args = split((source.getRaw() as Message<true>)
        .content
        .substring(prefix.length + name.length));
      // @ts-ignore Typescript is right about this one, but I haven't found any other good way to achieve this
      this.options = new CommandInteractionOptionResolver(bot.client, this.parseOptions(args));
    }
  }

  /** Supported context menu types */
  public static supportedContextMenus: { MESSAGE: boolean, USER: boolean } = {
    USER: false,
    MESSAGE: false,
  };

  /** Get an overview of this command */
  public static getOverview(): string {
    return `${this.data.names.join(', ')}**\n`
            + `${this.data.description}\n`;
  }

  /** Generate an embed about this command's usage */
  public static override getUsage(prefix: string): MessageEmbed {
    const name = this.data.names[0];
    const embed = new MessageEmbed()
      .setDescription(this.data.description)
      .setColor(this.data.defaultColor)
      .setAuthor({ name: `❔ Showing usage of ${prefix}${name}` })
      .addField('Usage', `\`${prefix}${name}${this.data.usage ? ` ${this.data.usage}` : ''}\``, true);
    if (this.data.userPerms) {
      embed.addField('Required Permissions', `\`${this.data.userPerms.join('`, `')}\``, true);
    }
    if (this.data.names.length > 1) {
      embed.addField('Aliases', this.data.names.slice(1).map((alias) => `\`${alias}\``).join(', '));
    }
    return embed;
  }
}
