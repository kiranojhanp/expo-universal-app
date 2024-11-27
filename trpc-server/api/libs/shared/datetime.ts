const datetime = {
  createTimeSpanDate,
  isWithinExpirationDate,
  timeFromNow,
};
export default datetime;

/**
 * Creates a date object offset by the specified time span.
 * @param {TimeSpan} timeSpan - The time span to offset the current date by.
 * @returns {Date} The resulting date.
 * @example
 * const timeSpan = new TimeSpan(5, "d");
 * const futureDate = createTimeSpanDate(timeSpan);
 * console.log(futureDate); // Prints the date 5 days from now
 */
function createTimeSpanDate(timeSpan: TimeSpan): Date {
  return new Date(Date.now() + timeSpan.milliseconds());
}

/**
 * Checks if a date is within the current time.
 * @param {Date} date - The date to check.
 * @returns {boolean} True if the date is in the future, false otherwise.
 * @example
 * const isValid = isWithinExpirationDate(new Date(Date.now() + 10000));
 * console.log(isValid); // Prints true if the date is in the future
 */
export function isWithinExpirationDate(date: Date): boolean {
  return Date.now() < date.getTime();
}

/**
 * Calculates the time difference from now to a specified date.
 * @param {Date} time - The target date.
 * @returns {string} The time difference in "Xm Ys" format.
 * @example
 * const difference = timeFromNow(new Date(Date.now() + 60000));
 * console.log(difference); // Prints "1m 0s"
 */
export function timeFromNow(time: Date): string {
  const now = new Date();
  const diff = time.getTime() - now.getTime();
  const minutes = Math.floor(diff / 1000 / 60);
  const seconds = Math.floor(diff / 1000) % 60;
  return `${minutes}m ${seconds}s`;
}

export type TimeSpanUnit = "ms" | "s" | "m" | "h" | "d" | "w";

/**
 * Represents a span of time with a specific value and unit.
 */
export class TimeSpan {
  /**
   * The numerical value of the time span.
   * @type {number}
   */
  public value: number;

  /**
   * The unit of time for the span.
   * @type {"ms" | "s" | "m" | "h" | "d" | "w"}
   */
  public unit: TimeSpanUnit;

  /**
   * Creates a new instance of the TimeSpan class.
   * @param {number} value - The numerical value of the time span.
   * @param {TimeSpanUnit} unit - The unit of time ("ms", "s", "m", "h", "d", or "w").
   * @example
   * const timeSpan = new TimeSpan(5, "d");
   * console.log(timeSpan.milliseconds()); // Prints the equivalent milliseconds for 5 days
   */
  constructor(value: number, unit: TimeSpanUnit) {
    this.value = value;
    this.unit = unit;
  }

  /**
   * Converts the time span to milliseconds.
   * @returns {number} The time span in milliseconds.
   * @example
   * const timeSpan = new TimeSpan(2, "h");
   * console.log(timeSpan.milliseconds()); // Prints 7200000 (2 hours in milliseconds)
   */
  public milliseconds(): number {
    switch (this.unit) {
      case "ms":
        return this.value;
      case "s":
        return this.value * 1000;
      case "m":
        return this.value * 1000 * 60;
      case "h":
        return this.value * 1000 * 60 * 60;
      case "d":
        return this.value * 1000 * 60 * 60 * 24;
      case "w":
        return this.value * 1000 * 60 * 60 * 24 * 7;
      default:
        throw new Error("Invalid unit");
    }
  }

  /**
   * Converts the time span to seconds.
   * @returns {number} The time span in seconds.
   * @example
   * const timeSpan = new TimeSpan(1, "m");
   * console.log(timeSpan.seconds()); // Prints 60 (1 minute in seconds)
   */
  public seconds(): number {
    return this.milliseconds() / 1000;
  }

  /**
   * Transforms the time span by multiplying its value by a factor.
   * @param {number} x - The factor to multiply the time span by.
   * @returns {TimeSpan} A new TimeSpan instance with the transformed value.
   * @example
   * const timeSpan = new TimeSpan(2, "h");
   * const doubledTimeSpan = timeSpan.transform(2);
   * console.log(doubledTimeSpan.milliseconds()); // Prints 14400000 (4 hours in milliseconds)
   */
  public transform(x: number): TimeSpan {
    return new TimeSpan(Math.round(this.milliseconds() * x), "ms");
  }
}
