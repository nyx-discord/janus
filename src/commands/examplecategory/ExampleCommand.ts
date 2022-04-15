import { ApplicationCommandOptionData, MessageEmbed } from 'discord.js';
import Command from '../../structures/commands/Command';
import { CommandData } from '../../structures/types';

export default class ExampleCommand extends Command {
  static override data: CommandData = {
    names: ['example', 'alias1', 'alias2'],
    description: 'Hello world',
    defaultColor: 0xFFFFFF,
    guildOnly: true,
  };

  override async execute() {
    const helloEmbed = new MessageEmbed()
      .setTitle('👋 Hello!')
      .setDescription(`This is an example command.
Notice how you can use \`example\` as an slash command, but \`alias1\` and \`alias2\` only work on text commands.
This example command is also marked as guildOnly, so it won't work on DMs.`)
      .addField('First option', this.options.getString('option') || 'Not specified');

    return this.reply(helloEmbed);
  }

  static override getOptions(): ApplicationCommandOptionData[] {
    return [
      {
        name: 'option',
        type: 'STRING',
        description: 'Some argument',
      },
      {
        name: 'choice',
        type: 'STRING',
        description: 'This argument has choices!',
        choices: [{ name: 'Choice A', value: 'Some choice' }, { name: 'Choice B', value: 'Some other choice' }],
      },
      {
        name: 'autocomplete',
        type: 'STRING',
        description: 'This argument uses autocompletes!',
        autocomplete: true,
      },
    ];
  }

  static override getAutocomplete(option: string): string[] {
    switch (option) {
      case 'autocomplete':
        return ['Option A', 'Option B', 'Option C'];
      default:
        return [];
    }
  }
}
