import { defineConfig } from "drizzle-kit";
import { DATABASE_PREFIX } from "@/constants/DB";

export default defineConfig({
  out: "./drizzle/migrations",
  dialect: "postgresql",
  schema: "./trpc-server/db/schema.ts",

  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },

  schemaFilter: "public",
  tablesFilter: [`${DATABASE_PREFIX}_*`],

  introspect: {
    casing: "camel",
  },
  migrations: {
    prefix: "timestamp",
    table: "__drizzle_migrations__",
    schema: "public",
  },

  entities: {
    roles: {
      provider: "",
      exclude: [],
      include: [],
    },
  },

  breakpoints: true,
  strict: true,
  verbose: true,
});
