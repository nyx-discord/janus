import { CronJob } from 'cron';

import Bot from '../Bot';
import { SubclassConstructor } from './types';

export type ScheduleSubclass = SubclassConstructor<typeof Schedule>;

/** An schedule that can be read by the bot */
export default abstract class Schedule {
  /** The bot that instantiated this Schedule */
  protected bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  /** This Schedule's CronJob */
  public job!: CronJob;

  /** Optional function to run once {@link Schedule#run}'s execution is complete */
  public onComplete?(): Promise<unknown>;

  /** Run this schedule */
  public abstract run(): Promise<unknown>;

  /** Interval between each run of this schedule. This needs to follow {@link http://crontab.org/ Cron syntax}. {@link https://crontab.guru/ See more here}. */
  public abstract interval: string | Date;

  /** Whether to run this schedule on bot load */
  public abstract runOnLoad: boolean;
}
