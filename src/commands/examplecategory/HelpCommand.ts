import {
  MessageEmbed,
  AutocompleteInteraction,
  ApplicationCommandOptionData,
} from 'discord.js';

import Command, { CommandSubclass } from '../../structures/commands/Command';
import { toTitleCase } from '../../utils/StringUtils';

import ParentCommand, { ParentCommandSubclass } from '../../structures/commands/ParentCommand';
import { CommandData } from '../../structures/types';
import Bot from '../../Bot';

export default class HelpCommand extends Command {
  static override data: CommandData = {
    names: ['help'],
    usage: '[command]',
    description: 'Show all the commands or information about a specific command.',
    defaultColor: 0xac3fd0,
  };

  override async execute() {
    const { prefixes } = this.bot.options;
    if (!prefixes.includes('/')) prefixes.push('/');

    const commandName = this.options.getString('command');

    const commands = this.bot.commands.getCommands();
    const categories = this.bot.commands.getCategories();

    if (!commandName) {
      const responseEmbed = new MessageEmbed()
        .setTitle('❔ Need help?')
        .setDescription(`
• Use \`${this.prefix}<command>\` to use a command, or \`${this.prefix}${this.name} <command>\` to obtain information about an specific command.

• You can also use \`${this.prefix}${this.name} <category>\` to see information about a specific command category.

• Bot prefixes: \`${prefixes.join('`, `')}\``)
        .setThumbnail(this.bot.client.user?.avatarURL() as string);

      categories.forEach((commandList, category) => {
        responseEmbed.addField(`${toTitleCase(category)} • ${commandList.length}`, `\`${commandList.map((c: any) => c.data.names[0]).flat().sort().join('`, `')}\``);
      });

      return this.reply(responseEmbed);
    }

    const category = categories.get(commandName);
    const FoundCommand = commands.get(commandName);

    if (category) {
      let description = '';

      category.forEach((categoryCommand) => {
        description += `**${this.prefix}${(categoryCommand as unknown as CommandSubclass).getOverview()}\n`;
      });

      return this.reply(new MessageEmbed()
        .setTitle(`❔ Commands in ${toTitleCase(commandName)}`)
        .setDescription(description)
        .setFooter({ text: `Choose ${this.prefix}<subcommand> to use a subcommand.` }));
    }

    if (FoundCommand) {
      const subCommandName = this.options.getString('subcommand');

      if (!subCommandName || !(FoundCommand instanceof ParentCommand)) return this.reply(await FoundCommand.getUsage(this.prefix));

      const ParentCommandClass = FoundCommand as unknown as ParentCommandSubclass;

      const commandInstance = new ParentCommandClass(this.bot, commandName, this.source, this.prefix, this.options);
      const FoundSubCommand = commandInstance.getSubCommand(subCommandName);

      if (!FoundSubCommand) return this.reply(await FoundCommand.getUsage(this.prefix));
      return this.reply(await FoundSubCommand.getConstructor().getUsage(this.prefix));
    }

    return this.sendUsage();
  }

  static override getOptions(): ApplicationCommandOptionData[] {
    return [
      {
        name: 'command',
        type: 'STRING',
        description: 'Command or category name',
        required: false,
        autocomplete: true,
      },
      {
        name: 'subcommand',
        type: 'STRING',
        description: 'Optional subcommand',
        required: false,
        autocomplete: true,
      },
    ];
  }

  static override getAutocomplete(option: string, interaction: AutocompleteInteraction, bot: Bot) {
    switch (option) {
      case 'command': {
        return bot.commands.getMainCommands();
      }
      case 'subcommand': {
        const options = ['No subcommands found for this command!'];

        const focusedCommand = interaction.options.getString('command');
        if (!focusedCommand) return options;
        const command = bot.commands.getCommands().get(focusedCommand) as unknown as ParentCommandSubclass;
        if (!command || !command.getSubCommands) return options;
        return command.getSubCommands().map((subcommand) => subcommand.data.names[0]);
      }
      default:
        return [];
    }
  }
}
