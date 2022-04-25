import { MongoMemoryServer } from "mongodb-memory-server";

const MONGO_VERSION = "4.4.12";

export async function getMongoMS() {
  const mongod = new MongoMemoryServer({
    binary: {
      version: MONGO_VERSION,
    },
  });
  await mongod.start();
  return mongod;
}
