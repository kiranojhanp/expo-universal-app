import { z } from "zod";
import { publicProcedure } from "@/trpc-server/api/trpc";

import type { TRPCRouterRecord } from "@trpc/server";

export const postRouter = {
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(async ({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
} satisfies TRPCRouterRecord;
