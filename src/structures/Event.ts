import Bot from '../Bot';

/** An event that can be read by the bot */
export default abstract class Event {
  /** The bot that instantiated this Event */
  protected bot: Bot;

  protected constructor(bot: Bot) {
    this.bot = bot;
  }

  /** Run this event */
  public abstract run(...args: unknown[]): Promise<unknown>;
}
