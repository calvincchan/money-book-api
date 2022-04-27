import MongooseService from "@/services/MongooseService";
import { FastifyPluginAsync } from "fastify";
import { readFileSync } from "fs";
import yaml from "js-yaml";
import Months from "./handlers/Months";
import Transactions from "./handlers/Transactions";

const main: FastifyPluginAsync = async (server) => {
  /** DB Models */
  await MongooseService.importModels(["Transaction", "Month"]);

  /** API Schema */
  const apiSchema = yaml.load(readFileSync(require.resolve("@/openapi/docs.yaml"), "utf-8"));
  Object.assign(apiSchema, { $id: "docs" });
  server.addSchema(apiSchema);

  /** Routes */
  server.get("/", async function () { return { status: "running" }; });

  /** Transactions */
  server.get(`/transactions`, { schema: { response: { "2xx": { type: "array", items: { $ref: "docs#/components/schemas/Transaction" } } } } }, Transactions.query);
  server.post(`/transactions`, { schema: { body: { $ref: "docs#/components/schemas/Transaction__edit" } } }, Transactions.insert);
  server.get(`/transactions/:id`, { schema: { response: { "2xx": { $ref: "docs#/components/schemas/Transaction" } } } }, Transactions.detail);
  server.patch(`/transactions/:id`, { schema: { body: { $ref: "docs#/components/schemas/Transaction__edit" } } }, Transactions.update);
  server.delete(`/transactions/:id`, Transactions.remove);

  /** Months */
  server.get(`/months/:yearMonth`, { schema: { response: { "2xx": { $ref: "docs#/components/schemas/Month" } } } }, Months.getByYearMonth);
};

export default main;
