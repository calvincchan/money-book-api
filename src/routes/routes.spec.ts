import { getMongoMS } from "@/common/test-mongo-ms";
import { Transaction } from "@/models/Transaction";
import ConfigService from "@/services/ConfigService";
import MongooseService from "@/services/MongooseService";
import Fastify, { FastifyInstance } from "fastify";
import moment from "moment";
import { MongoMemoryServer } from "mongodb-memory-server";
import initModule from ".";

describe(`Routes`, () => {
  let server: FastifyInstance;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    /** In-memory Mongo */
    mongod = await getMongoMS();
    await ConfigService.startUp({
      MONGO_URI: mongod.getUri(),
    });
    await MongooseService.startUp();

    /** Fastify */
    server = Fastify();
    server.setErrorHandler(function (error) {
      console.error(error);
      throw error;
    });
    server.register(initModule);
    await server.ready();

    /** Prepare init data */
    const db = MongooseService.getConnection();
    const Transaction = db.model<Transaction>("Transaction");
    for (let i = 1; i <= 10; i++) {
      await Transaction.create({
        value: Math.round(Math.random() * 1000), label: `transaction${i}`, transactionDate: new Date()
      })
    }
  });

  afterAll(async () => {
    await server.close();
    await MongooseService.shutDown();
    await ConfigService.shutDown()
    await mongod.stop();
  });

  describe(`/`, () => {
    it("should ping back", async () => {
      const res = await server.inject({
        method: "GET",
        url: `/`
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toMatchObject({ status: "running" });
    });
  });

  describe(`/transactions`, () => {
    it("should get all transactions", async () => {
      const res = await server.inject({
        method: "GET",
        url: "/transactions",
        query: { month: moment().format("YYYY-MM") }
      });
      expect(res.statusCode).toBe(200);
      expect(res.headers["x-total-count"]).toBe(10);
    });

    it("should insert a new transaction", async () => {
      const res = await server.inject({
        method: "POST",
        url: "/transactions",
        payload: { label: "newtransaction", value: 123456 }
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toMatchObject({ _id: 1010 })
    });

    it("should delete a transaction", async () => {
      const res = await server.inject({
        method: "DELETE",
        url: "/transactions/1010",
      });
      expect(res.statusCode).toBe(200);
    });
  });
});
