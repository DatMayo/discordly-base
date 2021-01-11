import { Message, TextChannel } from "discord.js";
import Event from "../../decorators/event.decorator";
import Command, { CommandMessage } from "../../decorators/command.decorator";
import { Discordly } from "../..";
import LevelsSchema, { LevelsModel } from "./levels.schema";
import { MessageChannel } from "worker_threads";
import { getGuildChannel } from "../../utils/discord-guild.utils";
import { BaseModule } from "../../definitions/module.base";

export class LevelModule extends BaseModule {
  constructor() {
    super();
    this.name = "Levels";
  }

  model: LevelsModel;

  public init() {
    if (!Discordly.useMongoDB()) {
      console.warn(`MongoDB needed for ${this.name} to Work`);
      return this.disable();
    }
    this.model = Discordly.connection.model(
      "levels",
      LevelsSchema
    ) as LevelsModel;

    console.info(`${this.name}-Module loaded & activated`);
  }

  @Event("message")
  async onMessage(message: Message) {
    if (message.author.bot) return;
    if (message.channel.type != "text") return;
    if (message.content.startsWith(process.env.PREFIX)) return;

    let discordId = message.author.id;

    let exists;
    try {
      exists = await this.model.exists({ discordId: discordId });
    } catch (err) {
      console.error(err);
    }

    if (!exists)
      await this.model.create({
        discordId: discordId,
        level: 0,
        xp: 0,
      });

    this.model.findOne({ discordId: discordId }, (err, res) => {
      if (err) return console.error(err);
      if (!res)
        return console.error(`Couldn\'t fetch user Level for ${discordId}`);
      let levelup = false;

      let level = res.level;
      let xp = res.xp;

      let nextLevelXp = level == 0 ? 83 : level * 83;
      let nextXp =
        xp +
        message.content.length *
          Number.parseFloat(Discordly.resolveSetting("levels", "xp"));

      while (nextXp >= nextLevelXp) {
        level++;
        levelup = true;
        nextXp -= nextLevelXp;
      }
      if (nextXp < 0) nextXp = 0;

      //update level in database
      this.model.updateOne(
        { discordId: discordId },
        { $set: { level: level, xp: nextXp } },
        (err, finalRes) => {
          if (err) return console.error(err);
          if (levelup) {
            (getGuildChannel(
              Discordly.resolveSetting("levels", "channel")
            ) as TextChannel).send(
              Discordly.resolveMessage(
                ["level", "up"],
                `<@${discordId}>`,
                level
              )
            );
          }
        }
      );
    });
  }

  @Command("level")
  onLevelCommand(command: CommandMessage) {
    this.model.findOne({ discordId: command.author.id }, (err, res) => {
      if (err) return console.error(err);
      command.channel.send(
        Discordly.resolveMessage(["level", "command"], res.level)
      );
    });
  }
}
