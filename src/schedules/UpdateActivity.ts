import Schedule from '../structures/Schedule';

export default class UpdateActivity extends Schedule {
  interval = '*/10 * * * *';

  runOnLoad = true;

  async run() {
    await this.bot.client.guilds.fetch();
    const memberCount = this.bot.client.guilds.cache.reduce((acc: number, guild) => acc + guild.memberCount, 0);
    this.bot.client.user.setActivity(`${memberCount} people!`, { type: 'WATCHING' });
  }
}
