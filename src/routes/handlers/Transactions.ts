import { Transaction } from "@/models/Transaction";
import MongooseService from "@/services/MongooseService";
import { RouteHandler } from "fastify";
import moment from "moment";
import { FilterQuery } from "mongoose";

const query: RouteHandler<{ Querystring: { month: string; day: string } }> = async function (req, res) {
  const db = MongooseService.getConnection();
  const Transaction = db.model<Transaction>("Transaction");
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

const insert: RouteHandler = async function (req, res) {
  const db = MongooseService.getConnection();
  const Transaction = db.model<Transaction>("Transaction");
  const result = await Transaction.create(req.body);
  return { _id: result._id };
}

const remove: RouteHandler<{ Params: { id: number } }> = async function (req, res) {
  const db = MongooseService.getConnection();
  const Transaction = db.model<Transaction>("Transaction");
  const result = await Transaction.findById(req.params.id);
  if (result) {
    await result.remove();
  }
  return { removed: req.params.id };
}

export default {
  query,
  insert,
  remove
}