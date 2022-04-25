import config from "@/services/ConfigService";
import Debug from "debug";
import Fastify, { FastifyInstance } from "fastify";
import cors from "fastify-cors";

/** Debugger */
const log = Debug("app:FastifyService");

/** Fastify server instance */
let server: FastifyInstance;

/**
 * Instantiate a Fastify server and load modules.
 */
export async function startUp(): Promise<FastifyInstance> {
  const loggerEnabled = process.env.NODE_ENV !== "production";
  // const loggerEnabled = false;
  server = await Fastify({ logger: loggerEnabled });

  /** CORS */
  server.register(cors, { origin: "*", exposedHeaders: ["X-Current-Page", "X-Page-Size", "X-Total-Pages", "X-Total-Count", "Content-Disposition"] });

  /** Init default routes. */
  server.get("/", async function () {
    return { status: "running" };
  });
  // server.get("/v2/public/*", restify.plugins.serveStaticFiles("./public"));

  /** Start server. */
  config.required(["HOST", "PORT"]);
  server.listen(config.get("PORT"), config.get("HOST"), (error, address) => {
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