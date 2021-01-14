import * as fs from "fs";
import * as Path from "path";
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
