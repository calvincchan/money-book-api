import MongooseService from "@/services/MongooseService";
import { FastifyPluginAsync } from "fastify";
import Transactions from "./handlers/Transactions";

const main: FastifyPluginAsync = async (server) => {
  /** DB Models */
  await MongooseService.importModels(["Transaction"]);
  // /** API Schema */
  // const apiSchema = yaml.load(readFileSync(require.resolve("@/openapi/core.yaml"), "utf-8"));
  // apiSchema.$id = "core";
  // server.addSchema(apiSchema);

  /** Routes */
  server.get("/", async function () { return { status: "running" }; });
  server.get(`/transactions`, Transactions.query);
  server.post(`/transactions`, Transactions.insert);
  server.delete(`/transactions/:id`, Transactions.remove);
};

export default main;