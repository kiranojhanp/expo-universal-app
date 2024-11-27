// import "server-only";
import crypto from "crypto";
import id from "@/libs/shared/id";
import adapter from "@/libs/auth/adapter";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { isWithinExpirationDate } from "@/libs/shared/datetime";
import { sessionExpiration } from "@/libs/auth";

import type { AuthSession, AuthUser } from "@/libs/auth/adapter";

const utils = {
  createSession,
  invalidateSession,
  invalidateUserSessions,
  validateSession,
  hashPassword,
  verifyPassword,
};
export default utils;

/**
 * Creates a new session for a given user ID.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<AuthSession>} The newly created session.
 * @example
 * const session = await createSession("user123");
 * console.log(session.id); // Prints the session ID
 */
async function createSession(userId: string): Promise<AuthSession> {
  const session: AuthSession = {
    userId,
    id: id.generateIdFromEntropySize(25),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  };
  await adapter.createSession(session);
  return session;
}

/**
 * Invalidates a session by its ID.
 * @param {string} sessionId - The ID of the session to invalidate.
 * @returns {Promise<void>}
 * @example
 * await invalidateSession("session123");
 * console.log("Session invalidated");
 */
async function invalidateSession(sessionId: string): Promise<void> {
  await adapter.deleteSession(sessionId);
}

/**
 * Invalidates all sessions for a given user.
 * @param {string} userId - The ID of the user whose sessions should be invalidated.
 * @returns {Promise<void>}
 * @example
 * await invalidateUserSessions("user123");
 * console.log("All sessions for the user have been invalidated");
 */
async function invalidateUserSessions(userId: string): Promise<void> {
  await adapter.deleteUserSessions(userId);
}

/**
 * Validates a session by its ID and refreshes its expiration if needed.
 * @param {string} sessionId - The ID of the session to validate.
 * @returns {Promise<{session: AuthSession; user: AuthUser; fresh: boolean} | {session: null; user: null}>}
 * The validated session and user, or null if invalid.
 * @example
 * const result = await validateSession("session123");
 * if (result.session) {
 *   console.log("Session is valid");
 * } else {
 *   console.log("Session is invalid");
 * }
 */
async function validateSession(
  sessionId: string
): Promise<
  | { session: AuthSession; user: AuthUser; fresh: boolean }
  | { session: null; user: null }
> {
  const dbSession = await adapter.getSessionAndUser(sessionId);
  if (!dbSession) {
    return { session: null, user: null };
  }

  if (!isWithinExpirationDate(dbSession.expiresAt)) {
    await adapter.deleteSession(sessionId);
    return { session: null, user: null };
  }

  const { user: dbUser, ...session } = dbSession;
  const { hashedPassword: _, ...user } = dbUser;

  const activePeriodExpirationDate = new Date(
    dbSession.expiresAt.getTime() - sessionExpiration.milliseconds() / 2
  );
  if (!isWithinExpirationDate(activePeriodExpirationDate)) {
    const newExpirationDate = new Date(
      Date.now() + sessionExpiration.milliseconds()
    );
    await adapter.updateSessionExpiration(sessionId, newExpirationDate);
    return { session, user, fresh: true };
  }

  return { session, user, fresh: false };
}

/**
 * Hashes a password using the scrypt algorithm.
 * @param {string} str - The password to hash.
 * @returns {Promise<string>} The hashed password in "salt:key" format.
 * @example
 * const hashedPassword = await hashPassword("mySecretPassword");
 * console.log(hashedPassword); // Prints the hashed password
 */
async function hashPassword(str: string): Promise<string> {
  const salt = encodeHexLowerCase(crypto.getRandomValues(new Uint8Array(16)));
  const blockSize = 16;
  const key = await generateScryptKey(str, salt, blockSize);
  return `${salt}:${key}`;
}

/**
 * Verifies a password against a hashed value.
 * @param {string} str - The password to verify.
 * @param {string} hash - The hashed password in "salt:key" format.
 * @returns {Promise<boolean>} True if the password matches, false otherwise.
 * @example
 * const isValid = await verifyPassword("mySecretPassword", "salt:key");
 * console.log(isValid); // Prints true or false
 */
async function verifyPassword(str: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(":");
  if (!salt || !key) return false;
  const keyToVerify = await generateScryptKey(str, salt);
  return key === keyToVerify;
}

/**
 * Generates a derived key using the scrypt algorithm.
 * @param {string} str - The input string.
 * @param {string} salt - The salt value.
 * @param {number} [blockSize=16] - The block size parameter.
 * @returns {Promise<string>} The derived key as a hexadecimal string.
 * @example
 * const key = await generateScryptKey("mySecretPassword", "salt");
 * console.log(key); // Prints the derived key
 */
async function generateScryptKey(
  str: string,
  salt: string,
  blockSize: number = 16
): Promise<string> {
  const encodedData = new TextEncoder().encode(str.normalize("NFKC"));
  const encodedSalt = new TextEncoder().encode(salt);
  const keyLength = 64;

  return new Promise<string>((resolve, reject) => {
    crypto.scrypt(
      encodedData,
      encodedSalt,
      keyLength,
      { N: 16384, r: blockSize, p: 1 },
      (err, derivedKey) => {
        if (err) reject(err);
        resolve(derivedKey.toString("hex"));
      }
    );
  });
}
