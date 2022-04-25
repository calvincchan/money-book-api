import { Transaction } from "@/models/Transaction";
import MongooseService from "@/services/MongooseService";
import { FastifyPluginAsync, RouteHandler } from "fastify";


const queryTransaction: RouteHandler = async function (req, res) {
  const db = MongooseService.getConnection();
  const Transaction = db.model<Transaction>("Transaction");
  const filter = {};
  const result = await Transaction.find(filter).sort("_id");
  const count = await Transaction.countDocuments(filter)
  res.header("X-Total-Count", count)
  return result;
}

const main: FastifyPluginAsync = async (server) => {
  /** DB Models */
  await MongooseService.importModels(["Transaction"]);
  // /** API Schema */
  // const apiSchema = yaml.load(readFileSync(require.resolve("@/openapi/core.yaml"), "utf-8"));
  // apiSchema.$id = "core";
  // server.addSchema(apiSchema);

  /** Routes */
  server.get("/", async function () { return { status: "running" }; });
  server.get(`/transactions`, queryTransaction);
};

export default main;