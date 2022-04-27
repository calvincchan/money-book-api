import appVersion from "@/version";
import assert from "assert";
import Debug from "debug";
import dotenv from "dotenv";
import fs from "fs";
import tmp from "tmp";

/** Debug logger */
const log = Debug("app:ConfigService");

class RuntimeConfigData {
  /** RUNTIME ONLY: Actually activated modules in the current runtime. */
  RUNTIME_MODULES_ENABLED?: string;
  /** RUNTIME ONLY: Project name in package.json. */
  APPNAME?: string;
  /** RUNTIME ONLY: Project version in package.json. */
  APPVERSION?: string;
  /** RUNTIME ONLY: Start time of the current run time. */
  APPSTARTDATE?: string;
  /** RUNTIME ONLY: Git commit hash.  */
  GITHASH?: string;
  /** RUNTIME ONLY: Git commit branch. */
  GITBRANCH?: string;
  /** RUNTIME ONLY: Git latest commit date */
  GITDATE?: string;
  /** RUNTIME ONLY: Git total commit count. */
  GITCOUNT?: string;
}

class ConfigData extends RuntimeConfigData {
  /** Server host */
  HOST?: string;
  /** Server port */
  PORT?: string;
  /** Revert server domain for deriving links that point back to this API server. */
  SERVER_DOMAIN?: string;
  /** Mongoose database connection string. */
  MONGO_URI?: string;
  /** Mongoose database name. */
  MONGO_DB_NAME?: string;
  /** SSL CA for secured Mongoose connection. */
  MONGO_SSL_CA?: string;
  /** Use "production" to turn off debug logging. */
  NODE_ENV?: string;
  /** Other keys */
  [key: string]: string | undefined;
}

const defaultConfig: ConfigData = {
  HOST: "0.0.0.0",
  PORT: "50420",
  SERVER_DOMAIN: "http://0.0.0.0:50420",
  MONGO_URI: "",
  MONGO_DB_NAME: "moneybook",
  MONGO_SSL_CA: "",
  NODE_ENV: "",
};

const config: ConfigData = {};

/** Tmp Files */
const tmpFiles: Record<string, tmp.FileResult> = {};

/**
 * Init the ConfigService with given init values, or use env vars.
 */
async function startUp(initConfigData?: ConfigData): Promise<void> {
  const customConfig: ConfigData = {};
  if (initConfigData) {
    Object.assign(customConfig, initConfigData);
  } else {
    dotenv.config();
    for (const key of Object.keys(defaultConfig)) {
      if (process.env[key]) {
        customConfig[key] = String(process.env[key]);
      }
    }
  }

  /** Build final config object. */
  Object.assign(config, defaultConfig, customConfig, {
    APPNAME: appVersion.name,
    APPVERSION: appVersion.version,
    APPSTARTDATE: String(new Date().valueOf()),
    GITHASH: appVersion.gitShort,
    GITBRANCH: appVersion.gitBranch,
    GITDATE: appVersion.gitDate,
    GITCOUNT: String(appVersion.gitCount),
  });

  /** Copy NODE_ENV from config back to process.env.NODE_ENV */
  process.env.NODE_ENV = get("NODE_ENV");

  /**
   * Auto enable full debug if NODE_ENV is `development`
   */
  if (process.env.NODE_ENV === "development") {
    Debug.enable("app*");
    // require("mongoose").set("debug", true);
  }

  /** Debug log */
  for (const k in config) {
    const v = config[k] || "";
    log(`${k}=${truncate(v)}`);
  }

  /** tmp graceful cleanup */
  tmp.setGracefulCleanup();
}

/** Set a key-value pair. */
function set(key: string, value: string): void {
  config[key] = value;
}

/** Get the value of a key. */
function get(key: string): string {
  assert(key in config, `ConfigService: unable to get missing key: ${key}`);
  return config[key] || "";
}

/** Check if a list of keys set in the config hash. */
function required(keys: string[]): void {
  const missing: string[] = [];
  for (const key of keys) {
    if (!(key in config)) {
      if (key in process.env) {
        config[key] = process.env[key];
        const v = config[key] || "";
        log(`${key}=${truncate(v)}`);
      } else {
        missing.push(key);
      }
    }
  }
  if (missing.length > 0) {
    throw Error(`ConfigService: missing required key(s): ${missing.map((x) => `[${x}]`).join(", ")}`);
  }
}

/**
 * Decode a base64 string and save it as temp file.
 * @returns File path
 */
function createTmpFile(key: string): string {
  if (tmpFiles[key]) {
    return tmpFiles[key].name;
  } else {
    const tmpobj = tmp.fileSync();
    assert(tmpobj, Error("Unable to create tmp file."));
    tmpFiles[key] = tmpobj;
    const content = Buffer.from(get(key), "base64");
    fs.writeFileSync(tmpobj.fd, content);
    return tmpobj.name;
  }
}

/** Remove temporary file by config key. */
function removeTempFile(key: string): void {
  assert(tmpFiles[key], Error(`Unable to remove tmp file for key=${key}`));
  tmpFiles[key].removeCallback();
}

/** Remove all temporary files created by createTmpFile(). */
async function shutDown(): Promise<void> {
  for (const key in tmpFiles) {
    tmpFiles[key]?.removeCallback();
  }
}

function truncate(text: string): string {
  return text.length > 60 ? text.substring(0, 60) + "..." : text;
}

export default {
  startUp,
  shutDown,
  set,
  get,
  required,
  createTmpFile,
  removeTempFile,
};
