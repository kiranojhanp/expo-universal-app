import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: true,
    idle_timeout: 20,
  },
  schema,
});
