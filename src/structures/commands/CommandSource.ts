import {
  Message,
  CommandInteraction,
  ContextMenuInteraction,
  CommandInteractionOptionResolver,
  User,
  MessageOptions,
  ReplyMessageOptions,
  InteractionReplyOptions,
  ButtonInteraction,
  WebhookEditMessageOptions, MessageEditOptions,
} from 'discord.js';

type SupportedInteractions = CommandInteraction | ContextMenuInteraction | ButtonInteraction;
type SupportedSources = Message | SupportedInteractions;

export default class CommandSource {
  /** Whether the source is an interaction */
  public readonly isInteraction: boolean;

  /** Message (For text commands) */
  private readonly message!: Message;

  /** Interaction (For SlashCommands or ContextMenus) */
  private readonly interaction!: SupportedInteractions;

  /** Last response (For messages) */
  private response!: Message;

  constructor(input: SupportedSources) {
    if (input instanceof Message) {
      this.isInteraction = false;
      this.message = input;
    } else if (input instanceof CommandInteraction || input instanceof ContextMenuInteraction || input instanceof ButtonInteraction) {
      this.isInteraction = true;
      this.interaction = input;
    } else {
      throw new TypeError('Unknown command source type!');
    }
  }

  /** Get the raw interaction or message */
  public getRaw(): SupportedSources {
    return this.isInteraction ? this.interaction : this.message;
  }

  /** Get the CommandInteractionOptionResolver (only for interactions) */
  public getOptions(): CommandInteractionOptionResolver | null {
    return this.isInteraction && !(this.interaction instanceof ButtonInteraction)
      ? (this.interaction.options as CommandInteractionOptionResolver)
      : null;
  }

  /** Get the user that triggered the interaction / sent the message */
  public getUser(): User {
    return this.isInteraction ? this.interaction.user : this.message.author;
  }

  /** Reply according to the source's previous state */
  public async reply(options: MessageOptions | ReplyMessageOptions | InteractionReplyOptions | WebhookEditMessageOptions): Promise<Message> {
    const messageOptions = options;
    if (this.isInteraction) {
      (messageOptions as InteractionReplyOptions).fetchReply = true;

      if (this.interaction.replied) return await this.interaction.followUp(messageOptions as InteractionReplyOptions) as Message;

      if (this.interaction.deferred) return await this.interaction.editReply(messageOptions) as Message;

      return await this.interaction.reply(messageOptions as InteractionReplyOptions) as unknown as Message;
    }
    this.response = await this.message.reply(messageOptions as MessageOptions);
    return this.response;
  }

  /** Defers according to the source's type */
  public async defer(ephemeral: boolean = false): Promise<void> {
    if (this.isInteraction) {
      if (this.interaction.deferred) return;
      await this.interaction.deferReply({ ephemeral });
      return;
    }
    await this.message.channel.sendTyping();
  }

  /** Edits the last reply according to the source's type */
  public editReply(options: MessageOptions): Promise<Message> {
    if (this.isInteraction) {
      return this.interaction.editReply(options) as Promise<Message>;
    }
    return this.response.edit(options as MessageEditOptions);
  }
}
