import { Transaction } from "@/models/Transaction";
import MongooseService from "@/services/MongooseService";
import { FastifyPluginAsync, RouteHandler } from "fastify";
import moment from "moment";
import { FilterQuery } from "mongoose";


const queryTransaction: RouteHandler<{ Querystring: { month: string; day: string } }> = async function (req, res) {
  const db = MongooseService.getConnection();
  const Transaction = db.model<Transaction>("Transaction");
  console.log("🚀 ~ file: index.ts ~ line 12 ~ req.query", req.query);
  const filter = deriveFilter(req.query);
  const result = await Transaction.find(filter).sort("_id");
  const count = await Transaction.countDocuments(filter);
  res.header("X-Total-Count", count)
  return result;
}

function deriveFilter(query: { month: string; day: string }): FilterQuery<Transaction> {
  const { month, day } = query;
  let result: FilterQuery<Transaction> = {};
  if (month) {
    const filterFrom = moment(month).startOf("month").toDate();
    const filterTo = moment(month).endOf("month").toDate();
    result = {
      transactionDate: { $gte: filterFrom, $lte: filterTo }
    }
  } else if (day) {
    const filterFrom = moment(day).startOf("day").toDate();
    const filterTo = moment(day).endOf("day").toDate();
    result = {
      transactionDate: { $gte: filterFrom, $lte: filterTo }
    }
  }
  return result;
}

const insertTransaction: RouteHandler = async function (req, res) {
  const db = MongooseService.getConnection();
  const Transaction = db.model<Transaction>("Transaction");
  const result = await Transaction.create(req.body);
  return { _id: result._id };
}

const removeTransaction: RouteHandler<{ Params: { id: number } }> = async function (req, res) {
  const db = MongooseService.getConnection();
  const Transaction = db.model<Transaction>("Transaction");
  const result = await Transaction.findById(req.params.id);
  if (result) {
    await result.remove();
  }
  return { removed: req.params.id };
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
  server.post(`/transactions`, insertTransaction);
  server.delete(`/transactions/:id`, removeTransaction);
};

export default main;