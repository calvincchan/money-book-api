import initRoutes from "@/routes";
import config from "@/services/ConfigService";
import CorsPlugin from "@fastify/cors";
import Debug from "debug";
import Fastify, { FastifyInstance } from "fastify";

/** Debugger */
const log = Debug("app:FastifyService");

/** Fastify server instance */
let server: FastifyInstance;

/**
 * Instantiate a Fastify server and load modules.
 */
export async function startUp(): Promise<FastifyInstance> {
  const loggerEnabled = process.env.NODE_ENV === "development";
  // const loggerEnabled = false;
  server = await Fastify({
    logger: loggerEnabled, ajv: {
      customOptions: {
        strict: false,
        allowUnionTypes: true,
        removeAdditional: "all", // Refer to [ajv options](https://ajv.js.org/#options)
      },
    },
  });

  /** CORS */
  server.register(CorsPlugin, { origin: "*", exposedHeaders: ["X-Current-Page", "X-Page-Size", "X-Total-Pages", "X-Total-Count", "Content-Disposition"] });

  /** Init default routes. */
  server.register(initRoutes);

  /** Start server. */
  config.required(["HOST", "PORT"]);
  server.listen({
    port: parseInt(config.get("PORT")),
    host: config.get("HOST")
  }, (error, address) => {
    if (error) {
      console.error(`🚨 Unable to start server: ${error}`);
    } else {
      console.log(`✨ Listening at ${address}`);
    }
  });
  return server;
}

/**
 * Async close Restify server
 */
export async function shutDown(): Promise<void> {
  log(`Shutting down server`);
  await server?.close();
  log(`Shut down server completed`);
}

export default {
  startUp,
  shutDown
}