import { TimeSpan } from "@/trpc-server/api/libs/shared/datetime";

export const sessionExpiration = new TimeSpan(30, "d");
export const sessionCookieName = "auth_session";
export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;
