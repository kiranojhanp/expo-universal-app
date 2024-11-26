import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

export const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: true,
    idle_timeout: 20,
  },
  schema,
});

export type DB = typeof db;
