import { Month } from "@/models/Month";
import MongooseService from "@/services/MongooseService";
import { RouteHandler } from "fastify";

const getByYearMonth: RouteHandler<{ Params: { yearMonth: string } }> = async function (req) {
  const db = MongooseService.getConnection();
  const Month = db.model<Month>("Month");
  const [year, month] = String(req.params.yearMonth).split("-");
  const filter = { year, month };
  const result = await Month.findOne(filter);
  if (result) {
    return result;
  } else {
    return new Month({ year, month });
  }
}

const insert: RouteHandler = async function (req) {
  const db = MongooseService.getConnection();
  const Month = db.model<Month>("Month");
  const result = await Month.create(req.body);
  return { _id: result._id };
}

export default {
  getByYearMonth,
  insert,
}