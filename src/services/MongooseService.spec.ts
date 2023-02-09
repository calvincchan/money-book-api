import { getMongoMS } from "@/common/test-mongo-ms";
import { Month } from "@/models/Month";
import { Transaction } from "@/models/Transaction";
import ConfigService from "@/services/ConfigService";
import MongooseService from "@/services/MongooseService";
import expect from "expect";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Connection } from "mongoose";

describe("MongooseService", () => {
  let db: Connection;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    /** In-memory Mongo */
    mongod = await getMongoMS();
    const uri = mongod.getUri();
    await ConfigService.startUp({
      MONGO_URI: uri
    });
  });

  afterAll(async () => {
    await mongod.stop();
  });

  it("should start up the service", async () => {
    await MongooseService.startUp();
    const connection = MongooseService.getConnection();
    expect(connection).toBeTruthy();
    if (connection) {
      db = connection;
    }
  });

  it("should load Month model", async () => {
    await MongooseService.importModels(["Month"]);
    const month = await db.model<Month>("Month").create({ year: 2023, month: 6 });
    expect(month._id).toBeTruthy();
    expect(month).toMatchObject({
      year: 2023,
      month: 6,
      openingBalance: 0,
      closingBalance: 0,
      value: 0,
    })
  });

  it("should load Transaction model", async () => {
    await MongooseService.importModels(["Transaction"]);
    const transaction = await db.model<Transaction>("Transaction").create({ value: 123, label: "transaction1", transactionDate: new Date("2023-6-15") });
    expect(transaction._id).toBeTruthy();
  });

  it("should shut down", async () => {
    await MongooseService.shutDown();
  });
});
