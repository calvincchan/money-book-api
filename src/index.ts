import ConfigService from '@/services/ConfigService';
import FastifyService from '@/services/FastifyService';
import MongooseService from './services/MongooseService';

(async () => {
  try {
    await ConfigService.startUp();
    await MongooseService.startUp();
    await FastifyService.startUp();

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