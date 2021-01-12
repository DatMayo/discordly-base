import "reflect-metadata";

import * as dotenv from "dotenv";
import * as Path from "path";
import * as util from "util";
import * as TSLog from "tslog";
import * as fs from "fs";

import { Client, Message } from "discord.js";

import { Connection, ConnectionOptions, createConnection } from "mongoose";
import defaultSettings, { SETTINGS } from "./config/settings";
import defaultMessages from "./config/messages";
import Event, { EVENTS } from "./lib/decorators/event.decorator";
import { memberHasRole } from "./utils/discord-member.utils";
import { CommandMessage, COMMANDS } from "./lib/decorators/command.decorator";
import { MODULES } from "./lib/classes/module.class";

dotenv.config({ path: Path.join(__dirname, "..", ".env") });

export const Logger: TSLog.Logger = new TSLog.Logger({
  name: "Logger",
  dateTimePattern: SETTINGS.logger.dateTimePattern,
  overwriteConsole: true,
});

if (!fs.existsSync(SETTINGS.logger.dir())) fs.mkdirSync(SETTINGS.logger.dir());
Logger.attachTransport({
  silly: (obj) => SETTINGS.logger.transport(obj),
  debug: (obj) => SETTINGS.logger.transport(obj),
  trace: (obj) => SETTINGS.logger.transport(obj),
  info: (obj) => SETTINGS.logger.transport(obj),
  warn: (obj) => SETTINGS.logger.transport(obj, true),
  error: (obj) => SETTINGS.logger.transport(obj, true),
  fatal: (obj) => SETTINGS.logger.transport(obj, true),
});
export class Discordly {
  public static client: Client;
  public static connection: Connection;

  constructor() {
    Discordly.client = new Client();
    Discordly.client.login(process.env.TOKEN);

    this.init();
  }

  async init() {
    if (Discordly.useMongoDB()) {
      this.setUpMongoDB();
    }
    try {
      await this.loadModules();
    } catch (err) {
      console.error(err);
    }

    this.registerEvents();

    Discordly.client.on("message", (message: Message) => {
      if (message.channel.type != "text") return;
      if (message.content.startsWith(process.env.PREFIX)) {
        let cmdMessage = message.content.substring(1);
        let cmdMessageArgs = cmdMessage.split(" ");
        let command = cmdMessageArgs.shift();
        if (COMMANDS.hasOwnProperty(command.toLowerCase())) {
          let cmdObj = COMMANDS[command.toLowerCase()];
          let allowed = false;
          let allowedChannel = false;

          if (cmdObj.disabled) return;

          //Allowed Roles
          if (cmdObj.allowedRoles.length > 0) {
            for (const roleId of cmdObj.allowedRoles) {
              if (memberHasRole(message.author.id, roleId)) {
                allowed = true;
                break;
              } else {
                allowed = false;
              }
            }
          } else {
            allowed = true;
          }
          //Disallowed Roles
          if (cmdObj.disallowedRoles.length > 0) {
            for (const roleId of cmdObj.disallowedRoles) {
              if (memberHasRole(message.author.id, roleId)) {
                allowed = false;
                break;
              }
            }
          }

          //Allowed channels to use the Command in
          if (cmdObj.allowedChannels.length > 0) {
            for (const channelId of cmdObj.allowedChannels) {
              if (channelId == message.channel.id) {
                allowedChannel = true;
                break;
              } else {
                allowedChannel = false;
              }
            }
          } else {
            allowedChannel = true;
          }
          //Disallowed channels, where the command should not be functional
          if (cmdObj.disallowedChannels.length > 0) {
            for (const channelId of cmdObj.disallowedChannels) {
              if (channelId == message.channel.id) {
                allowedChannel = false;
                break;
              }
            }
          }

          if (allowed) {
            if (allowedChannel) {
              message["commandName"] = command.toLowerCase();
              if (!MODULES[cmdObj.module].disabled && !cmdObj.disabled) {
                cmdObj.action.call(
                  MODULES[cmdObj.module],
                  message as CommandMessage
                );
              }
            } else {
              message.delete();
              message.author.send(
                Discordly.resolveMessage(
                  ["command", "unallowedchannel"],
                  command,
                  message.channel.name
                )
              );
            }
          } else {
            message.delete();
            message.author.send(
              Discordly.resolveMessage(["command", "nopermission"], command)
            );
          }
        } else {
          message.channel.send(
            Discordly.resolveMessage(["command", "notfound"], command)
          );
        }
      }
    });
  }

  /**
   * Register all Events to the Client
   */
  registerEvents() {
    //Loop Trough all events
    Object.keys(EVENTS).forEach((event) => {
      //Loop tough all Funktions/Information for a event
      EVENTS[event].forEach((eventData) => {
        //add listener to the discord Client
        Discordly.client[eventData.once ? "once" : "on"](event, (...args) => {
          //if discord ID not Equal return
          if (
            args[0] &&
            args[0].guild &&
            args[0].guild.id != process.env.DISCORD_ID
          )
            return;

          //run actual event
          if (!MODULES[eventData.module].disabled && !eventData.disabled) {
            eventData.action.call(MODULES[eventData.module], ...args);
          }
        });
      });
    });
  }

  static useMongoDB(): boolean {
    return !(
      process.env.MONGO_HOST == undefined ||
      process.env.MONGO_HOST.length == 0 ||
      process.env.MONGO_PORT == undefined ||
      process.env.MONGO_PORT.length == 0
    );
  }

  setUpMongoDB(): void {
    let user = process.env.MONGO_USER || null;
    let pass = process.env.MONGO_PASS || null;
    let authDatabase = process.env.MONGO_AUTH_DATABASE || "admin";

    //MongoDB Settings
    let options: ConnectionOptions = {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    };

    //Auth Data
    if (user != null && pass != null) {
      options.auth = {
        password: pass,
        user: user,
      };
      options.authSource = authDatabase;
    }

    //init Connection
    Discordly.connection = createConnection(
      `mongodb://${process.env.MONGO_HOST || "127.0.0.1"}:${
        Number.parseInt(process.env.MONGO_PORT) || 27017
      }/${process.env.MONGO_DATABASE || "discordly"}`,
      options
    );
  }

  loadModules() {
    return new Promise<void>((resolve, reject) => {
      fs.readdir(
        SETTINGS.modules,
        { withFileTypes: true },
        async (err, files) => {
          if (err) return reject(err);
          for (const file of files) {
            if (file.isDirectory()) {
              if (
                !fs.existsSync(
                  Path.join(SETTINGS.modules, file.name, file.name + ".js")
                )
              )
                return console.error(
                  `Das Modul ${file.name} konnte nicht Initialisiert werden. (Missing Index)`
                );
              let imp = await import(
                Path.join(SETTINGS.modules, file.name, `${file.name}.js`)
              );
              let impinst = new imp[Object.keys(imp)[0]]();
              MODULES[impinst.name] = impinst;
              if (typeof impinst.init == "function") impinst.init();
            } else {
              let imp = await import(Path.join(SETTINGS.modules, file.name));
              let impinst = new imp[Object.keys(imp)[0]]();
              MODULES[impinst.name] = impinst;
              if (typeof impinst.init == "function") impinst.init();
            }
          }
          return resolve();
        }
      );
    });
  }

  /**
   * Resolve Config-Var from Config (MongoDB & settings.ts)
   *
   * @param keys string[]
   */
  static resolveSetting(...keys): string {
    let nextSettingsLevel = defaultSettings;
    keys.forEach((key) => {
      if (nextSettingsLevel.hasOwnProperty(key)) {
        nextSettingsLevel = nextSettingsLevel[key];
      } else {
        console.error(`Key ${key} not found in Settings`);
      }
    });
    return nextSettingsLevel.toString();
  }

  /**
   * Resolve Message from Message-Config (MongoDB & settings.ts)
   *
   * @param keys string[]
   * @param args string[]
   */
  static resolveMessage(keys: string[], ...args) {
    let nextMessageLevel = defaultMessages;
    keys.forEach((key) => {
      if (nextMessageLevel.hasOwnProperty(key)) {
        nextMessageLevel = nextMessageLevel[key];
      } else {
        console.error(`Key ${key} not found in Settings`);
      }
    });
    let message = nextMessageLevel.toString();

    //Replace message Key's
    if (args.length > 0) {
      let matches = message.match(SETTINGS.varPattern);
      matches.forEach((match) => {
        let key = Number.parseInt(match.replace(/[^0-9]{1,}/g, ""));
        if (args[key] == undefined) message = message.replace(match, "NULL");
        message = message.replace(match, args[key]);
      });
    }
    return message;
  }
}

new Discordly();
