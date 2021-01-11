import { MessageEmbed } from "discord.js";

export const generateEmbed = (
  title: string,
  description: string,
  color: string = "00897B",
  fields: Record<string, string> = {},
  inlineFields: boolean = false
): MessageEmbed => {
  let embed = new MessageEmbed();
  if (title != null && title.length > 0) embed.setTitle(title);
  if (description != null && description.length > 0)
    embed.setDescription(description);
  embed.setColor("#" + color);
  Object.keys(fields).forEach((key) => {
    embed.addField(key, fields[key], inlineFields);
  });
  return embed;
};
