/**
 * Document Number Generator - HIYES Format
 *
 * Generates unique document numbers following the HIYES format:
 * HIYES{YY}{M}{DD}{NNN}
 *
 * Where:
 * - YY: Year (last 2 digits)
 * - M: Month (A-L for Jan-Dec)
 * - DD: Day (AA-ZZ using double letter encoding)
 * - NNN: Serial number (001-999)
 *
 * Example: HIYES25JBA001
 * - 25: Year 2025
 * - J: October (10th month)
 * - BA: 27th day
 * - 001: First document of the day
 */

/**
 * Convert month number (1-12) to letter (A-L)
 */
function monthToLetter(month: number): string {
  if (month < 1 || month > 12) {
    throw new Error(`Invalid month: ${month}. Must be between 1 and 12.`);
  }
  // A=1, B=2, ..., L=12
  return String.fromCharCode(64 + month);
}

/**
 * Convert day number (1-31) to double-letter encoding
 *
 * This follows the original HIYES encoding from main.py:
 * - First letter: Increments every 26 days (A for 1-26, B for 27-31)
 * - Second letter: Cycles through A-Z for each group
 *
 * Examples:
 * - Day 1: AA
 * - Day 26: AZ
 * - Day 27: BA
 * - Day 31: BE
 */
function dayToDoubleLetters(day: number): string {
  if (day < 1 || day > 31) {
    throw new Error(`Invalid day: ${day}. Must be between 1 and 31.`);
  }

  // Original HIYES logic from main.py
  const firstLetter = String.fromCharCode(
    64 + Math.floor(day / 26) + (day % 26 !== 0 ? 1 : 0)
  );
  const secondLetter = String.fromCharCode(64 + (day % 26 !== 0 ? day % 26 : 26));

  return firstLetter + secondLetter;
}

/**
 * Generate HIYES document number
 *
 * @param date - The document date
 * @param counter - Serial number for the day (1-999)
 * @returns HIYES document number (e.g., HIYES25JBA001)
 */
export function generateDocumentNumber(date: Date, counter: number): string {
  if (counter < 1 || counter > 999) {
    throw new Error(`Invalid counter: ${counter}. Must be between 1 and 999.`);
  }

  // Extract year (last 2 digits)
  const year = date.getFullYear().toString().slice(-2);

  // Convert month to letter (A-L)
  const month = monthToLetter(date.getMonth() + 1); // getMonth() is 0-indexed

  // Convert day to double letters
  const day = dayToDoubleLetters(date.getDate());

  // Format counter as 3-digit zero-padded number
  const serialNumber = counter.toString().padStart(3, '0');

  // Combine into HIYES format
  return `HIYES${year}${month}${day}${serialNumber}`;
}

/**
 * Parse HIYES document number into components
 *
 * @param documentNumber - HIYES document number (e.g., HIYES25JBA001)
 * @returns Object with year, month, day, counter
 */
export function parseDocumentNumber(documentNumber: string): {
  year: number;
  month: number;
  day: number;
  counter: number;
  date: Date;
} | null {
  // Regex: HIYES{YY}{M}{DD}{NNN}
  const pattern = /^HIYES(\d{2})([A-L])([A-Z]{2})(\d{3})$/;
  const match = documentNumber.match(pattern);

  if (!match) {
    return null;
  }

  const [, yearStr, monthLetter, dayLetters, counterStr] = match;

  // Parse year (20XX)
  const year = 2000 + parseInt(yearStr, 10);

  // Parse month (A=1, B=2, ..., L=12)
  const month = monthLetter.charCodeAt(0) - 64;

  // Parse day from double letters
  const firstLetterIndex = dayLetters.charCodeAt(0) - 64;
  const secondLetterIndex = dayLetters.charCodeAt(1) - 64;
  const day = (firstLetterIndex - 1) * 26 + secondLetterIndex;

  // Parse counter
  const counter = parseInt(counterStr, 10);

  // Construct date
  const date = new Date(year, month - 1, day);

  return {
    year,
    month,
    day,
    counter,
    date,
  };
}

/**
 * Validate HIYES document number format
 *
 * @param documentNumber - Document number to validate
 * @returns true if valid, false otherwise
 */
export function isValidDocumentNumber(documentNumber: string): boolean {
  const pattern = /^HIYES\d{2}[A-L][A-Z]{2}\d{3}$/;
  return pattern.test(documentNumber);
}

/**
 * Get the next available counter for a specific date
 *
 * This should query Firestore to find all documents created on the same date
 * and return the next available counter value.
 *
 * @param date - The date to check
 * @returns Promise<number> - Next available counter (1-999)
 */
export async function getNextCounterForDate(_date: Date): Promise<number> {
  // This is a client-side stub
  // The actual implementation should be on the backend (Cloud Function)
  // to ensure atomicity and avoid race conditions

  // For client-side use, this would call a Cloud Function:
  // const result = await generateDocumentNumber({ date });
  // return result.counter;

  // Placeholder implementation
  console.warn('getNextCounterForDate should be called via Cloud Function');
  return 1;
}

/**
 * Example usage and test cases
 */
export const EXAMPLE_DOCUMENT_NUMBERS = {
  // January 1, 2025 - First document
  example1: generateDocumentNumber(new Date(2025, 0, 1), 1), // HIYES25AAA001

  // October 27, 2025 - First document
  example2: generateDocumentNumber(new Date(2025, 9, 27), 1), // HIYES25JBA001

  // December 31, 2025 - 10th document
  example3: generateDocumentNumber(new Date(2025, 11, 31), 10), // HIYES25LBE010
};

// For development/testing
if (typeof window !== 'undefined') {
  (window as any).documentNumberGenerator = {
    generateDocumentNumber,
    parseDocumentNumber,
    isValidDocumentNumber,
    monthToLetter,
    dayToDoubleLetters,
    EXAMPLE_DOCUMENT_NUMBERS,
  };
}
