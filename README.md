<p align="center">
  <a href="#">
    <img alt="Nyx" src="https://cdn.discordapp.com/attachments/707047887200321609/963261054249492490/nyx.png"/>
  </a>
</p>

---

<p align="center">
  Nyx is a Discord bot template written in Typescript, supporting most of Discord.js' features alongside tools useful for bot development.
</p>

<p align="center">
  <a href="https://github.com/Amgelo563/nyx/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Nyx is released under the MIT license." />
  </a>
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome!" />
  <img src="https://img.shields.io/badge/Forks-welcome-brightgreen.svg" alt="PRs welcome!" />
</p>

## 📚 Introduction
This is a template for giving developers (and myself) an easy but robust start to develop a bot.

The template as it is is not completely meant to be used for big public bots since it doesn't support crucial stuff for it like Sharding, or, ironically, it supports stuff that they don't need like message commands, though you can always adapt this to your liking.

The bot is 100% working just by cloning the repo, installing dependencies and setting up your config.json, and, as a matter of fact, it includes some example commands to see the possibilities of the bot.

This template is greatly inspired by [Modbot](https://github.com/aternosorg/modbot).


## ✨ Features
All of these features are included on the template. You can modify each of them to your liking or add more of them.

### Events
* Register many actions per event, or listen to your own.

### Schedules
* Schedule actions to happen only at a certain time or every once on a while.
* Stop and resume Schedules to your liking.
* [Using Cron](https://crontab.guru/) to power the schedules.

### Commands
* Both message and slash command support with only one declaration.
* Subcommand support, registered on Discord as well.
* Add your own argument parsing for message commands, and the one already provided by Discord for interactions.
* Command aliases (only message commands), command description and command syntax support.
* Multiple prefixes support.
* Command categories support based on folder names.
* Permission checking (Members can only execute commands if they have certain permissions) support.
* Autocompletions support: answer to autocompletes as you'd like.
* Discord's context menus ([User Commands](https://discord.com/developers/docs/interactions/application-commands#user-commands) and [Message Commands](https://discord.com/developers/docs/interactions/application-commands#message-commands)) support.
* Default support for DM commands, can be turned off per command.
* Colorize your commands by adding a `defaultColor` to their data.

### Other
* Built-in [Prisma](https://www.prisma.io/) support for easier and faster database managing.
* Built-in [Tracer](https://www.npmjs.com/package/tracer) support for powerful logging.
* *(Theorically but not really practical?)* Support for multiple bots running at once.

## 🚧 Disclaimers
* To avoid meaningless commands, only the first name is used to register slash commands. The rest only work for message commands.
* There are some parts (like static overriding on Commands data) that aren't exactly pretty. The template is always open to suggestions and/or PRs.
