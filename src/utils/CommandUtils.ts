import { Collection, Message } from 'discord.js';
import { CommandSubclass } from '../structures/commands/Command';
import ApplicationCommand from '../structures/commands/ApplicationCommand';
import { ProcessedMessageCommand } from '../structures/types';

/** Get the command that was executed on this message, if any */
export function getCommandName(message: Message, prefixes: string[]): ProcessedMessageCommand {
  if (message.author.bot || !message.content) return { isCommand: false };

  let prefix = '';

  prefixes.every((value: string) => {
    if (message.content.startsWith(value)) {
      prefix = value;
      return false;
    }
    return true;
  });
  const args = message.content.slice(prefix.length).split(' ');

  if (!args.length || !prefix) return { isCommand: false };

  return {
    isCommand: true,
    name: args[0].toLowerCase(),
    args: args.slice(1),
    prefix,
  };
}

/** Get the application commands based on command classes */
export function getApplicationCommands(commands: CommandSubclass[]): Collection<string, ApplicationCommand> {
  const result: Collection<string, ApplicationCommand> = new Collection();
  for (const command of commands) {
    result.set(`CHAT_INPUT:${command.data.names[0]}`, new ApplicationCommand(command, 'CHAT_INPUT'));

    if (command.supportedContextMenus.USER) {
      result.set(`USER:${command.data.names[0]}`, new ApplicationCommand(command, 'USER'));
    }
    if (command.supportedContextMenus.MESSAGE) {
      result.set(`MESSAGE:${command.data.names[0]}`, new ApplicationCommand(command, 'MESSAGE'));
    }
  }
  return result;
}
