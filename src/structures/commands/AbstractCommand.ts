import {
  ApplicationCommandOptionData,
  AutocompleteInteraction,
  CommandInteraction,
  CommandInteractionOptionResolver,
  Message,
  MessageActionRow,
  MessageAttachment,
  MessageEmbed,
  MessageEditOptions,
  MessageOptions,
} from 'discord.js';

import Bot from '../../Bot';
import {
  BaseOptions,
  BaseAdditions,
  CommandData,
  SubclassConstructor,
} from '../types';
import CommandSource from './CommandSource';
import { Colors, Symbols } from '../../utils/Constants';
import { getMessageOptions, sendTemporal } from '../../utils/DiscordUtils';

export type AbstractCommandSubclass = SubclassConstructor<typeof AbstractCommand>;

/* A Command, Subcommand group or SubCommand */
export default abstract class AbstractCommand {
  /** The bot's last answer to this command */
  protected response!: Message;

  /** Options passed at this command execution */
  protected options!: CommandInteractionOptionResolver;

  /* Source of command execution */
  protected source: CommandSource;

  /** Bot that instanciated this command */
  protected bot: Bot;

  /** Prefix used to call the command or main command */
  protected prefix: string;

  constructor(
    bot: Bot,
    source: CommandSource,
    prefix: string,
  ) {
    this.bot = bot;
    this.source = source;
    this.prefix = prefix;
  }

  /** The data to represent this command. */
  public static data: CommandData;

  /** Used for Application Command definition at Discord */
  public static getOptions(): ApplicationCommandOptionData[] {
    return [];
  }

  /** Get the usage of this command */
  public static getUsage(_: string): MessageEmbed { return new MessageEmbed(); }

  /** Return the autocompletable options associated with this option */
  public static getAutocomplete(_option: string, _interaction: AutocompleteInteraction, _bot: Bot): string[] { return []; }

  /** Execute this command */
  public abstract execute(): Promise<unknown>;

  /** This lets access static members from a non static view (https://github.com/Microsoft/TypeScript/issues/3841) */
  public getConstructor() {
    return Object.getPrototypeOf(this).constructor;
  }

  /** Defer this command's response */
  protected async defer(): Promise<void> {
    await this.source.defer(this.getConstructor().data.ephemeral ?? false);
  }

  /** Reply to the source of execution */
  protected async reply(
    message: BaseOptions,
    ...additions: Array<BaseAdditions>
  ): Promise<Message> {
    const messageOptions = this.getMessageOptions(message, ...additions);
    if (this.response || (this.source.isInteraction && (this.source.getRaw() as CommandInteraction).deferred)) return this.edit(messageOptions);
    this.response = await this.source.reply(messageOptions);
    return this.response;
  }

  /** Edit the last response */
  protected async edit(message: BaseOptions, ...additions: Array<BaseAdditions>): Promise<Message> {
    if (!this.response && this.source.getRaw() instanceof Message) throw new Error('There\'s no response to edit.');
    const messageOptions = this.getMessageOptions(message, ...additions);

    if (!this.source.isInteraction) return this.response.edit(messageOptions as MessageEditOptions);
    this.response = await (this.source.getRaw() as CommandInteraction).editReply(messageOptions) as Message;
    return this.response;
  }

  /** Send or edit the last response with an error embed */
  protected async sendError(message: string | null): Promise<Message | void> {
    const errorEmbed = new MessageEmbed()
      .setTitle(`${Symbols.ERROR} Error`)
      .setColor(Colors.RED)
      .setDescription('An internal error happened while executing that command.');
    if (message) errorEmbed.addField('Message', `\`\`\`${message}\`\`\``);

    if (this.response || (this.source.isInteraction && (this.source.getRaw() as CommandInteraction).deferred)) return this.edit(errorEmbed);

    return sendTemporal(this.source, { embeds: [errorEmbed] });
  }

  /** Send an embed about this command's usage */
  protected async sendUsage(): Promise<void> {
    await this.reply(this.getConstructor().getUsage(this.prefix));
  }

  /** Utility to get the MessageOptions from the message and additions specified */
  protected getMessageOptions(message: BaseOptions, ...additions: Array<MessageEmbed | MessageAttachment | MessageActionRow>): MessageOptions {
    return getMessageOptions(this.getConstructor().data, this.source, message, ...additions);
  }
}
