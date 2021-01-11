import * as Path from "path";
import * as fs from "fs";
import * as TSLog from "tslog";

export const SETTINGS = {
  root: Path.join(__dirname, ".."),
  services: Path.join(__dirname, "..", "services"),
  modules: Path.join(__dirname, "..", "modules"),
  logger: {
    dateTimePattern: "day-month-year hour:minute:second",
    dir: (root: string = SETTINGS.root) => {
      return `${root}/logs`;
    },
    transport: (logObject: TSLog.ILogObject, error: boolean = false) => {
      fs.appendFileSync(
        `${SETTINGS.logger.dir()}/${error ? "error" : "info"}.log`,
        JSON.stringify(logObject) + "\n"
      );
    },
  },
  varPattern: /\{( *.?)\}/g,
};

export const defaultSettings = {
  levels: {
    channel: "760939291915452429",
    use: true,
    xp: 0.22,
  },
};
export default defaultSettings;
