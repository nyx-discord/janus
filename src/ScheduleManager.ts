import { Collection } from 'discord.js';
import fs from 'fs';
import { CronJob } from 'cron';

import BotType from './Bot';
import { ScheduleSubclass } from './structures/Schedule';

export default class ScheduleManager {
  /** The bot that instanciated this manager */
  private readonly bot: BotType;

  /** Collection of <Schedule name, CronJob> */
  protected readonly schedules: Collection<string, CronJob> = new Collection<string, CronJob>();

  constructor(bot: BotType) {
    this.bot = bot;
  }

  /** Load Schedules */
  async init() {
    const { schedulesPath } = this.bot.options;
    const schedules = fs
      .readdirSync(schedulesPath)
      .filter((content) => fs.lstatSync(`${schedulesPath}/${content}`).isFile() && content.endsWith('.js'));

    for (const schedule of schedules) {
      try {
        // ? Eslint is right about this one, but I haven't found any other good way to achieve this
        // eslint-disable-next-line global-require,import/no-dynamic-require
        const ImportedSchedule = require(`${schedulesPath}/${schedule}`).default as ScheduleSubclass;
        const scheduleInstance = new ImportedSchedule(this.bot);
        const cronJob = new CronJob(
          scheduleInstance.interval,
          scheduleInstance.run,
          scheduleInstance.onComplete,
          undefined,
          undefined,
          scheduleInstance,
        );
        scheduleInstance.job = cronJob;
        this.schedules.set(ImportedSchedule.name, cronJob);
        /** Run this task manually instead of using cron's builtIn startNow just in case the Schedule uses the job property */
        // eslint-disable-next-line no-await-in-loop
        if (scheduleInstance.runOnLoad) await scheduleInstance.run();
        cronJob.start();
      } catch (error) {
        this.bot.logger.error(`There was an error while loading schedule ${schedule}.`, error);
      }
    }
    this.bot.logger.info(`Loaded ${this.schedules.size} schedules!`);
  }

  getSchedules() {
    return this.schedules;
  }
}
