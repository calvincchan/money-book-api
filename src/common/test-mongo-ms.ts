import { MongoMemoryServer } from "mongodb-memory-server";

/** MongoDB version */
const MONGO_VERSION = "5.0.14";

/** Create a instance of MongoDB in memory for testing only. */
export async function getMongoMS() {
  const mongod = new MongoMemoryServer({
    binary: {
      version: MONGO_VERSION,
    },
  });
  await mongod.start();
  return mongod;
}
