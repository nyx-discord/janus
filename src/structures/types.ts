import {
  ColorResolvable,
  InteractionReplyOptions,
  MessageActionRow,
  MessageAttachment,
  MessageEmbed,
  MessageOptions,
  PermissionResolvable,
  ReplyMessageOptions,
} from 'discord.js';

/** Options for creating a bot */
export interface BotOptions {
  /** Spooky */
  token: string,
  /** The prefixes for this bot's message commands */
  prefixes: string[],
  /** Whether to force load the application commands to Discord */
  loadApplication: boolean,
  /** The url to this bot's database */
  database: string,
  /** The path to this bot's commands */
  commandsPath: string,
  /** The path to this bot's events */
  eventsPath: string,
  /** The path to this bot's schedules */
  schedulesPath: string,
}

/** Data used to register a command */
export interface CommandData {
  /**
   * Command name / Aliases
   * The first name is registered for Application Commands,
   * the rest are only used for text (message) commands
   */
  names: string[];
  /** Command description (for HelpCommand and getUsage) */
  description: string;
  /** Default embed color */
  defaultColor: ColorResolvable;
  /** Command usage (for HelpCommand and getUsage) */
  usage?: string;
  /** Permissions needed to execute */
  userPerms?: PermissionResolvable[];
  /** Whether responses should be ephemeral by default */
  ephemeral?: boolean;
  /** Should this command only work on Guilds */
  guildOnly?: boolean;
}

/** Result of whether a certain Message contains a command */
export interface ProcessedMessageCommand {
  isCommand: boolean
  name?: string,
  args?: string[],
  prefix?: string,
}

/** Result of whether a certain member can execute a command */
export interface ProcessedPermission {
  /** Whether this user can execute the command */
  canExecute: boolean,
  /** If this command can't be executed, the reason why */
  reason?: string,
  /** The permissions that the member lacks to execute the command */
  missingPerms?: PermissionResolvable[]
}

/** Base MessageOptions that can be extended with additions */
export type BaseOptions =
    string
    | MessageOptions
    | ReplyMessageOptions
    | InteractionReplyOptions
    | MessageActionRow
    | MessageEmbed
    | MessageAttachment;

/** Additions that can be added to BaseOptions */
export type BaseAdditions = MessageEmbed | MessageAttachment | MessageActionRow;

/** Type of constructor of a subclass of an abstract class */
export type SubclassConstructor<TCtor extends abstract new (...args: any[]) => any> =
  Pick<TCtor, keyof TCtor> & (new (...args: ConstructorParameters<TCtor>) => InstanceType<TCtor>);
