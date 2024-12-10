import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { publicProcedure } from "@/trpc/server/api/trpc";

export const testRouter = {
  hello: publicProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query((opts) => {
      return {
        greeting: `Hello ${opts.input.text}`,
      };
    }),
  echo: publicProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .mutation((opts) => {
      return {
        greeting: `echo: ${opts.input.text}`,
      };
    }),
} satisfies TRPCRouterRecord;
