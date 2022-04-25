import ConfigService from '@/services/ConfigService';
import assert from 'assert';
import debug from "debug";
import moment from 'moment';
import MongooseService from './services/MongooseService';

/**
 * Auto enable full debug of NODE_ENV is not `production`
 */
if (process.env.NODE_ENV !== "production") {
  debug.enable("app*");
  // require("mongoose").set("debug", true);
}

/**
 * Assert timezone is +0800
 */
assert(moment().utcOffset() === 480, "System timezone must be +0800");

(async () => {
  try {
    await ConfigService.startUp();
    await MongooseService.startUp();

    /** Notify pm2 that we are ready to serve. */
    if (process.send) {
      process.send("ready");
    }

    console.log("✨ Main loop ready");
  } catch (error) {
    console.error("🚨 Main loop exception", error);
    await gracefulShutDown();
  }

  /**
 * Async close all services
 */
  async function gracefulShutDown() {
    await MongooseService.shutDown();
    await ConfigService.shutDown();
    return true;
  }
})();