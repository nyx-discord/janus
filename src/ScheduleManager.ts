import { Collection } from 'discord.js';
import fs from 'fs';
import { schedule as cronSchedule, ScheduledTask, validate as validateSchedule } from 'node-cron';

import BotType from './Bot';

export default class ScheduleManager {
  /** The bot that instanciated this manager */
  private readonly bot: BotType;

  /** Collection of <Schedule name, ScheduledTask> */
  private readonly schedules: Collection<string, ScheduledTask> = new Collection<string, ScheduledTask>();

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
        const ImportedSchedule = require(`${schedulesPath}/${schedule}`).default;
        const ScheduleInstance = new ImportedSchedule(this.bot);
        if (validateSchedule(ScheduleInstance.interval)) {
          const cronTask = cronSchedule(ScheduleInstance.interval, ScheduleInstance.run);
          this.schedules.set(ImportedSchedule.name, cronTask);
          if (ScheduleInstance.runOnLoad) ScheduleInstance.run();
        } else {
          this.bot.logger.error(`Schedule ${schedule}'s interval is not valid.`);
          return;
        }
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
