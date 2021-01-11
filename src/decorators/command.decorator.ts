import { Message } from "discord.js";
export interface CommandDefinition {
  name: string;
  action: Function;
  disabled: boolean;
  allowedRoles: string[];
  allowedChannels: string[];
  disallowedRoles: string[];
  disallowedChannels: string[];
  module: string;
}
export interface CommandDefinitionOptions {
  allowedRoles?: string[];
  allowedChannels?: string[];
  disallowedRoles?: string[];
  disallowedChannels?: string[];
  disabled?: boolean;
}
export interface CommandMessage extends Message {
  commandName: string;
}
export const COMMANDS: Record<string, CommandDefinition> = {};
const Command = (command: string, options: CommandDefinitionOptions = {}) => {
  return <MethodDecorator>(
    function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      let t = new target.constructor();
      if (!COMMANDS.hasOwnProperty(command)) {
        COMMANDS[command] = {
          action: descriptor.value,
          name: command,
          disabled: options.disabled || false,
          allowedRoles: options.allowedRoles || [],
          disallowedRoles: options.disallowedRoles || [],
          allowedChannels: options.allowedChannels || [],
          disallowedChannels: options.disallowedChannels || [],
          module: t.name,
        };
      } else {
        console.warn(`Duplicated command key ${command}`);
      }
    }
  );
};
export default Command;
