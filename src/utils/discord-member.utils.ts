import { getgid } from "process";
import { getGuild } from "./discord-guild.utils";

export const getMemberName = (discordId: string): string => {
  return getGuild().members.cache.find((m) => m.id == discordId).user.username;
};

export const memberHasRole = (discordId: string, roleId: string): boolean => {
  return (
    getGuild()
      .members.cache.find((m) => m.id == discordId)
      .roles.cache.find((r) => r.id == roleId) != undefined
  );
};
