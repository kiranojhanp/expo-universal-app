// "use server";

import { z } from "zod";
import id from "@/trpc-server/api/libs/shared/id";
import datetime from "@/trpc-server/api/libs/shared/datetime";
import utils from "@/trpc-server/api/libs/auth/utils";
import adapter from "@/trpc-server/api/libs/auth/adapter";
import { TimeSpan } from "@/trpc-server/api/libs/shared/datetime";
import {
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/trpc-server/api/libs/validators/auth";

import type {
  LoginInput,
  SignupInput,
} from "@/trpc-server/api/libs/validators/auth";

/**
 * Generic structure for action responses.
 * @template T - The shape of the form data being validated.
 * @property {object} [errors] - Details of field or form errors.
 * @property {boolean} success - Indicates whether the action was successful.
 */
export interface ActionResponse<T> {
  errors?: {
    fieldError?: Partial<Record<keyof T, string | undefined>>;
    formError?: string;
    exception?: string;
  };
  success: boolean;
}

/**
 * Logs in a user by validating their credentials and initiating a session.
 *
 * @param {FormData} formData - The login form data containing email and password.
 * @returns {Promise<ActionResponse<LoginInput>>} - The result of the login attempt.
 *
 * @example
 * const formData = new FormData();
 * formData.append("email", "user@example.com");
 * formData.append("password", "password123");
 * const response = await login(formData);
 */
export async function login(
  formData: FormData
): Promise<ActionResponse<LoginInput>> {
  const obj = Object.fromEntries(formData.entries());

  const parsed = loginSchema.safeParse(obj);
  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      success: false,
      errors: {
        fieldError: {
          email: err.fieldErrors.email?.[0],
          password: err.fieldErrors.password?.[0],
        },
      },
    };
  }

  const { email, password } = parsed.data;
  const existingUser = await adapter.getUserWithEmail(email);

  if (!existingUser?.hashedPassword) {
    return {
      success: false,
      errors: {
        formError: "Incorrect email or password",
      },
    };
  }

  const validPassword = await utils.verifyPassword(
    password,
    existingUser.hashedPassword
  );

  if (!validPassword) {
    return {
      success: false,
      errors: {
        formError: "Incorrect email or password",
      },
    };
  }

  // TODO: Implement session creation, cookie setting, and redirection
  return { success: true };
}

/**
 * Signs up a new user, validates their data, and initiates email verification.
 *
 * @param {FormData} formData - The signup form data containing email and password.
 * @returns {Promise<ActionResponse<SignupInput>>} - The result of the signup attempt.
 *
 * @example
 * const formData = new FormData();
 * formData.append("email", "user@example.com");
 * formData.append("password", "password123");
 * const response = await signup(formData);
 */
export async function signup(
  formData: FormData
): Promise<ActionResponse<SignupInput>> {
  const obj = Object.fromEntries(formData.entries());

  const parsed = signupSchema.safeParse(obj);
  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      success: false,
      errors: {
        fieldError: {
          email: err.fieldErrors.email?.[0],
          password: err.fieldErrors.password?.[0],
        },
      },
    };
  }

  const { email, password } = parsed.data;
  const existingUser = await adapter.getUserWithEmail(email);

  if (existingUser) {
    return {
      success: false,
      errors: {
        formError: "Cannot create account with that email",
      },
    };
  }

  const userId = id.generateId(21);
  const hashedPassword = await utils.hashPassword(password);
  await adapter.insertUser({ id: userId, email, hashedPassword });
  const verificationCode = await generateEmailVerificationCode(userId, email);

  // send email with verification code
  // create session
  // set cookie
  // redirect to verify email screen
  return { success: true };
}

export async function logout(): Promise<{ error: string } | void> {
  // get session from request
  // validate session in database
  // invalidate session
  // clear cookies
  // redirect to login pages
}

export async function resendVerificationEmail(): Promise<ActionResponse<{}>> {
  // get user from request
  // if no user, redirect to login screen
  // check last sent code with `adapter.getEmailVerificationCodeWithUserId(user.id)`
  // check if last sent code is within expiration date with `utils.isWithinExpirationDate(lastSent.expiresAt)`
  // make user wait until this code expires for a resend
  // generate new email verification code
  // send email with verification code
  return { success: true };
}

export async function verifyEmail(
  formData: FormData
): Promise<ActionResponse<{}>> {
  const code = formData.get("code");
  if (typeof code !== "string" || code.length !== 8) {
    return {
      success: false,
      errors: {
        fieldError: {
          code: "Invalid code",
        },
      },
    };
  }

  // get user from request
  // if no user, redirect to login screen
  // get and delete verification code with `adapter.getAndDeleteEmailVerificationCodeWithUserId(user.id)`
  // if code from db != code from form, return "Invalid verification code"
  // if the code from db has expired, return "Verification code expired"
  // if email assigned to code in db != email in user from request, return "Email does not match"
  // invalidate user session using `utils.invalidateUserSessions(user.id)`
  // update user to verified with `adapter.updateUser(user.id, { emailVerified: true })`
  // create session
  // set cookie
  // redirect to dashboard screen
  return { success: true };
}

export async function sendPasswordResetLink(
  formData: FormData
): Promise<ActionResponse<{}>> {
  const email = formData.get("email");
  const parsed = z.string().trim().email().safeParse(email);
  if (!parsed.success) {
    return {
      success: false,
      errors: {
        fieldError: {
          code: "Provided email is invalid.",
        },
      },
    };
  }

  try {
    const user = await adapter.getUserWithEmail(parsed.data);
    if (!user || !user.emailVerified) {
      return {
        success: false,
        errors: {
          exception: "Provided email is invalid.",
        },
      };
    }

    const verificationToken = await generatePasswordResetToken(user.id);
    const verificationLink = `${process.env.EXPO_PUBLIC_API_URL}/reset-password/${verificationToken}`;

    // send email with verification link
    return { success: true };
  } catch {
    return {
      success: false,
      errors: {
        exception: "Failed to send verification email.",
      },
    };
  }
}

export async function resetPassword(
  formData: FormData
): Promise<ActionResponse<{}>> {
  const obj = Object.fromEntries(formData.entries());
  const parsed = resetPasswordSchema.safeParse(obj);

  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      success: false,
      errors: {
        fieldError: err.fieldErrors.password?.[0] ?? err.fieldErrors.token?.[0],
      },
    };
  }

  const { token, password } = parsed.data;

  const dbToken = await adapter.getAndDeletePasswordResetToken(token);
  if (!dbToken) {
    return {
      success: false,
      errors: { exception: "Invalid password reset link" },
    };
  }

  if (!datetime.isWithinExpirationDate(dbToken.expiresAt)) {
    return {
      success: false,
      errors: { exception: "Password reset link expired." },
    };
  }

  await utils.invalidateUserSessions(dbToken.userId);
  const hashedPassword = await utils.hashPassword(password);
  await adapter.updateUser(dbToken.userId, { hashedPassword });
  const session = await utils.createSession(dbToken.userId);
  // set cookie
  // redirect to dashboard screen

  return { success: true };
}

/**
 * Generates a unique email verification code for a user.
 *
 * @param {string} userId - The unique identifier of the user.
 * @param {string} email - The user's email address.
 * @returns {Promise<string>} - The generated verification code.
 */
async function generateEmailVerificationCode(
  userId: string,
  email: string
): Promise<string> {
  await adapter.deleteUserEmailVerificationCodes(userId);
  const code = id.generateId(8);
  await adapter.insertEmailVerificationCode({
    userId,
    email,
    code,
    expiresAt: datetime.createTimeSpanDate(new TimeSpan(10, "m")),
  });
  return code;
}

/**
 * Generates a password reset token for a user.
 *
 * @param {string} userId - The unique identifier of the user.
 * @returns {Promise<string>} - The generated password reset token.
 */
async function generatePasswordResetToken(userId: string): Promise<string> {
  await adapter.deleteUserPasswordResetTokens(userId);
  const tokenId = id.generateId(40);
  await adapter.insertPasswordResetToken({
    id: tokenId,
    userId,
    expiresAt: datetime.createTimeSpanDate(new TimeSpan(2, "h")),
  });
  return tokenId;
}
