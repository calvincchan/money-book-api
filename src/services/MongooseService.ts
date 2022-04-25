import ConfigService from "@/services/ConfigService";
import assert from "assert";
import debug from "debug";
import fs from "fs";
import mongoose, { Connection } from "mongoose";
import path from "path";

const log = debug("app:MongooseService");

/** Connection pool */
let DB_CONNECTION: Connection;

/** name of models activated. */
const activeModels: Set<string> = new Set();

/**
 * Async initialize database.
 */
export async function startUp(): Promise<void> {
  ConfigService.required(["MONGO_URI", "MONGO_DB_NAME", "MONGO_SSL_CA"]);
  const MONGO_URI = ConfigService.get("MONGO_URI");
  const MONGO_DB_NAME = ConfigService.get("MONGO_DB_NAME");
  const MONGO_SSL_CA = ConfigService.get("MONGO_SSL_CA");

  /** Prepare SSL CA if available. */
  let sslCA;
  if (MONGO_SSL_CA) {
    debug(`Loading Mongo SSL CA: ${MONGO_SSL_CA}`);
    assert(fs.existsSync(path.resolve(MONGO_SSL_CA)), `Mongo SSL CA [${MONGO_SSL_CA}] file not found.`);
    sslCA = MONGO_SSL_CA;
  }

  /** Initialize master database. */
  DB_CONNECTION = await makeConnection(MONGO_URI, MONGO_DB_NAME, sslCA);

  log("Mongoose connections established");
}

async function makeConnection(connectionUri: string, databaseName: string, sslCA?: string): Promise<Connection> {
  const dbUri = connectionUri + databaseName;
  const options = {
    autoIndex: true,
    bufferCommands: false, // Disabling https://mongoosejs.com/docs/connections.html#buffering
    sslCA,
  };
  const db = await mongoose.createConnection(dbUri, options).asPromise();
  return db;
}


/**
 * Get the master database connection
 */
export function getConnection(): Connection {
  return DB_CONNECTION;
}

/**
 * Gracefully shut down all database connections.
 */
export async function shutDown(): Promise<void> {
  log(`Shutting down db connection.`);
  await DB_CONNECTION.close();

  /** Completed */
  log(`Shut down completed.`);
}

export async function importModels(modelNames: string[]): Promise<void> {
  log(`Importing master models: ${modelNames.join(", ")}`);
  for (const modelName of modelNames) {
    if (!activeModels.has(modelName)) {
      /** Register to activeModels */
      activeModels.add(modelName);
      /** Attach the model to all connections amd master connection */
      try {
        log(`+ ${modelName}`);
        const { initModel } = await import(`@/models/${modelName}`);
        await initModel(DB_CONNECTION, "master");
      } catch (error) {
        console.error(`Import ${modelName} failed`, error);
        throw error;
      }
    }
  }
}

export default {
  startUp,
  getConnection,
  importModels,
  shutDown,
};
