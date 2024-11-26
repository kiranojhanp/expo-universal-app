import { defineConfig } from "drizzle-kit";
import { DATABASE_PREFIX } from "@/constants/DB";

export default defineConfig({
  schema: "./trpc-server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  tablesFilter: [`${DATABASE_PREFIX}_*`],
});
