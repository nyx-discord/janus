import { AutocompleteInteraction } from 'discord.js';
import ParentCommand from '../../structures/commands/ParentCommand';
import Event from '../../structures/Event';
import { SubclassConstructor } from '../../structures/types';

export default class AutocompleteResponder extends Event {
  override async run(interaction: AutocompleteInteraction) {
    if (!interaction.isAutocomplete()) return;

    const commandInput = [interaction.commandName, interaction.options.getSubcommand(false)];

    const mainCommand = this.bot.commands.getCommands()
      .get(commandInput.shift() as string) as unknown as SubclassConstructor<typeof ParentCommand>;
    let command = mainCommand;
    if (commandInput.shift()) {
      command = mainCommand
        .getSubCommands()
        .find((subcommand) => subcommand.data.names[0] === commandInput[0]) as unknown as SubclassConstructor<typeof ParentCommand>;
    }

    const focusedOption = interaction.options.getFocused(true);
    const choices = command.getAutocomplete(focusedOption.name, interaction, this.bot);

    const filtered = choices.filter((choice: string) => choice
      .toLowerCase()
      .startsWith(`${focusedOption.value}`.toLowerCase()))
      .slice(0, 24)
      .sort();

    await interaction.respond(filtered.map((choice: string) => ({ name: choice, value: choice })));
  }
}
