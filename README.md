<p align="center">
<img src="logo.png" alt="Discordly Base" style="max-width: 40%">
</p>

# Discordly Base ![ISSUES](https://img.shields.io/github/issues/Fokklz/discordly-base)

> modular base for a Discord bot

A modular Discord bot using MongoDB coded with typescript

# Prerequisites
- MongoDB installed on the local computer or a server
- [A Discord Bot Token](https://github.com/Fokklz/discordly-base/wiki/Create-a-Discord-Bot-Token)

# Configuration
The important configuration points can be found in the ```.env``` file. Optional adjustments can be made in ```lib/settings.ts```

# Install & Initial build
```bash
$ npm install
$ npm run build
```

# Development

```bash
$ npm run dev
```

The modules are loaded from the Modules folder & can be created either as a single file or as a folder. If it is a folder, the file should have the exact same name as the folder.

The main file of a module MUST export a class which extends BaseModule

## Create Module
Create a new File inside the modules folder, called ```mymodule.ts```
```ts
import { Module } from "../lib/classes/module.class";

export class MyModule extends Module {
  constructor() {
    super();

    //The variable Name in the module class defines 
    //how the module instance is referenced during runtime. 
    this.name = "MyModule";
  }

  //The init function is called directly after the import
  init() {
    console.info(`${this.name} has been loaded`);
  }
}
```
In order for the module to be loaded, it is necessary to define a settings block in ```lib/mongodb/default-settings.ts```. (if you have not moved your settings to mongodb)
In the settings, ```use``` must be defined & activated. for the module to be loaded

## Reference a module within a module
The name between the brackets is the name of the module which is set in the consturctor of the class
```ts
import { MODULES } from "../lib/classes/module.class";

MODULES["MyModule"].disable();
//etc..
```

## Events
```ts
import { Message } from "discord.js";
import Event from "../lib/decorators/event.decorator";

//Event Name - Once (opt.) - Disabled (opt.)
@Event("message", false, false)
onMessage(message: Message) {
    //TODO: handle message Event
}
```
## Commands
### **Options**
Key | Description
--- | ---
allowedRoles | Roles which are allowed to execute the command (ID)
disallowedRoles | Roles which are not allowed to execute the command (ID)
allowedChannels | Channels in which the command may be executed (ID)
disallowedChannels | Channels in which the command may not be executed (ID)
disabled | Disables the command if **true**
<br />

```ts
import Command, { CommandMessage } from "../lib/decorators/command.decorator";

//CommandName - Options
@Command("test", { disabled: false })
onTest(message: CommandMessage) {
    //TODO: action on Test Command
}
```

## Example
A level module is available for reference. If there are any questions, I will be happy to answer them

# Production Deployment
```bash
$ npm run start
```

## Work in Progress

I am in the progress of writing an introduction on how to use it for your Discord projects. Feel free to follow my
Twitch Channel to get regular updates and ask Questions: [twitch.tv/fokklz](https://twitch.tv/fokklz).
