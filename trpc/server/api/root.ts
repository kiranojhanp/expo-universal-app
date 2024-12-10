import { testRouter } from "./routers/test";

import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  test: testRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
