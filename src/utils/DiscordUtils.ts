import {
  CommandInteraction,
  ContextMenuInteraction,
  GuildMember,
  InteractionReplyOptions,
  Message,
  MessageOptions,
} from 'discord.js';
import { CommandData, ProcessedPermission } from '../structures/types';

export async function sendTemporal(
  reference: CommandInteraction | Message | ContextMenuInteraction,
  options: MessageOptions | InteractionReplyOptions,
) {
  const messageOptions = options;
  (messageOptions as InteractionReplyOptions).ephemeral = true;
  const temporalMessage = await reference.reply(messageOptions);
  if (!temporalMessage) return;

  setTimeout(async () => temporalMessage.delete(), 5000);
}

/** Check if the specified GuildMember can execute the command based on its CommandData */
export function canMemberExecute(member: GuildMember | null, data: CommandData): ProcessedPermission {
  const processedUser: ProcessedPermission = {
    canExecute: false,
    reason: '',
    missingPerms: [],
  };

  if (!member && (data.guildOnly || data.userPerms)) {
    processedUser.reason = 'You can only use this command inside a server.';
    return processedUser;
  }

  if (member && data.userPerms) {
    data.userPerms.forEach((perm) => {
      if (!member.permissions.has(perm)) processedUser.missingPerms?.push(perm);
    });

    if (processedUser.missingPerms?.length) {
      processedUser.reason = 'You don\'t have enough permissions to use this command.';
    }
  }

  processedUser.canExecute = true;

  return processedUser;
}
