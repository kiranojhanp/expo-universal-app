import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export const connection = postgres(process.env.DATABASE_URL!, {
  idle_timeout: 20,
});

export const db = drizzle(connection, { schema });
export type DB = typeof db;
