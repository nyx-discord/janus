import { Collection } from 'discord.js';
import fs from 'fs';

import BotType from './Bot';
import Event from './structures/Event';

export default class EventManager {
  /** The bot that instanciated this manager */
  private readonly bot: BotType;

  /** Collection of <ClientEvent string, Event list> */
  private readonly events: Collection<string, Event[]> = new Collection<string, Event[]>();

  constructor(bot: BotType) {
    this.bot = bot;
  }

  /** Load Events */
  async init() {
    const { eventsPath } = this.bot.options;
    const folders = fs
      .readdirSync(eventsPath)
      .filter((content) => fs.lstatSync(`${eventsPath}/${content}`).isDirectory());

    for (const folder of folders) {
      const eventFiles = fs
        .readdirSync(`${eventsPath}/${folder}`)
        .filter((event) => `${eventsPath}/${folder}/${event}`.endsWith('.js'));
      const eventInstances: Event[] = [];
      for (const event of eventFiles) {
        try {
          // ? Eslint is right about this one, but I haven't found any other good way to achieve this
          // eslint-disable-next-line global-require,import/no-dynamic-require
          const ImportedEvent = require(`${eventsPath}/${folder}/${event}`).default;
          const EventInstance = new ImportedEvent(this.bot);
          eventInstances.push(EventInstance);
        } catch (error) {
          this.bot.logger.error(`There was an error while loading event ${folder}/${event}.`, error);
        }
      }
      if (!eventInstances.length) this.bot.logger.warn(`The event folder ${folder} has no Events attached to it.`);
      this.events.set(folder, eventInstances);
    }
    this.listenEvents();
  }

  /** Start listening to the events */
  private listenEvents() {
    if (!this.events.size) return this.bot.logger.warn('The bot is not listening to any event!');
    this.events.forEach((eventList, eventName) => {
      this.bot.client.on(eventName, async (...args: unknown[]) => {
        eventList.forEach((event) => event.run(...args));
      });
    });
    this.bot.client.emit('load'); // ? Events are loaded after login, so the ready event will never be received. Use this instead.
    return this.bot.logger.info(`Listening to ${this.events.size} events!`);
  }

  getEvents() {
    return this.events;
  }
}
