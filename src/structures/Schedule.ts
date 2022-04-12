import Bot from '../Bot';

/** An schedule that can be read by the bot */
export default abstract class Schedule {
  /** The bot that instantiated this Schedule */
  protected bot: Bot;

  protected constructor(bot: Bot) {
    this.bot = bot;
  }

  /** Run this schedule */
  public abstract run(): Promise<unknown>;

  /** Interval between each run of this schedule. This needs to follow Cron syntax. */
  public abstract interval: string;

  /** Whether to run this schedule on bot load */
  public abstract runOnLoad: boolean;
}
