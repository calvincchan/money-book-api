import MongooseService from "@/services/MongooseService";
import { FastifyPluginAsync } from "fastify";
import Months from "./handlers/Months";
import Transactions from "./handlers/Transactions";

const main: FastifyPluginAsync = async (server) => {
  /** DB Models */
  await MongooseService.importModels(["Transaction", "Month"]);

  // /** API Schema */
  // const apiSchema = yaml.load(readFileSync(require.resolve("@/openapi/core.yaml"), "utf-8"));
  // apiSchema.$id = "core";
  // server.addSchema(apiSchema);

  /** Routes */
  server.get("/", async function () { return { status: "running" }; });

  /** Transactions */
  server.get(`/transactions`, Transactions.query);
  server.post(`/transactions`, Transactions.insert);
  server.get(`/transactions/:id`, Transactions.detail);
  server.patch(`/transactions/:id`, Transactions.update);
  server.delete(`/transactions/:id`, Transactions.remove);

  /** Months */
  server.get(`/months/:yearMonth`, Months.getByYearMonth);
};

export default main;