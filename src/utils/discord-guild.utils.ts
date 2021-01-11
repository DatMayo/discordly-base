import {
  Guild,
  GuildChannel,
  GuildMember,
  TextChannel,
  VoiceChannel,
} from "discord.js";

import { Discordly } from "../";

//Get guild By ID
export const getGuild = (): Guild => {
  return Discordly.client.guilds.cache.find(
    (g) => g.id == process.env.DISCORD_ID
  );
};

//Check if Guild ID from database is Valid
export const exists = (): boolean => {
  return getGuild() ? true : false;
};

//Count Guild Members
export const countMembers = (): number => {
  return getGuild().members.cache.size;
};

//Get Specific Channel by ID
export const getGuildChannel = (id: string): GuildChannel => {
  return getGuild().channels.cache.find((c) => c.id == id);
};
