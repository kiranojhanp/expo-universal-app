import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";

const id = {
  generateId,
  generateIdFromEntropySize,
};
export default id;

/**
 * Generates a random ID of the specified length.
 * @param {number} length - The length of the ID.
 * @returns {string} The generated ID.
 * @example
 * const id = generateId(10);
 * console.log(id); // Prints a 10-character random string
 */
function generateId(length: number): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((x) => alphabet[x % alphabet.length])
    .join("");
}

/**
 * Generates a random ID using entropy/random-values of the specified size.
 * @param {number} size - The size of entropy in bytes.
 * @returns {string} The generated ID as a Base32 string.
 * @example
 * const id = generateIdFromEntropySize(25);
 * console.log(id); // Prints a Base32 random string
 */
function generateIdFromEntropySize(size: number): string {
  const buffer = crypto.getRandomValues(new Uint8Array(size));
  return encodeBase32LowerCaseNoPadding(buffer);
}
