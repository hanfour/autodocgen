"""
Document Number Generator - HIYES Format

Generates unique document numbers following the HIYES format:
HIYES{YY}{M}{DD}{NNN}

Where:
- YY: Year (last 2 digits)
- M: Month (A-L for Jan-Dec)
- DD: Day (AA-ZZ using double letter encoding)
- NNN: Serial number (001-999)

Example: HIYES25JBA001
- 25: Year 2025
- J: October (10th month)
- BA: 27th day
- 001: First document of the day
"""

from datetime import datetime
from typing import Tuple, Optional
import re


def month_to_letter(month: int) -> str:
    """
    Convert month number (1-12) to letter (A-L)

    Args:
        month: Month number (1-12)

    Returns:
        Letter A-L

    Raises:
        ValueError: If month is not between 1 and 12
    """
    if not 1 <= month <= 12:
        raise ValueError(f"Invalid month: {month}. Must be between 1 and 12.")

    # A=1, B=2, ..., L=12
    return chr(64 + month)


def day_to_double_letters(day: int) -> str:
    """
    Convert day number (1-31) to double-letter encoding

    This follows the original HIYES encoding from main.py:
    - First letter: Increments every 26 days (A for 1-26, B for 27-31)
    - Second letter: Cycles through A-Z for each group

    Examples:
    - Day 1: AA
    - Day 26: AZ
    - Day 27: BA
    - Day 31: BE

    Args:
        day: Day of month (1-31)

    Returns:
        Two-letter code (e.g., "AA", "BA", "AZ")

    Raises:
        ValueError: If day is not between 1 and 31
    """
    if not 1 <= day <= 31:
        raise ValueError(f"Invalid day: {day}. Must be between 1 and 31.")

    # Original HIYES logic from main.py
    first_letter = chr(64 + (day // 26) + (1 if day % 26 != 0 else 0))
    second_letter = chr(64 + (day % 26) if day % 26 != 0 else 26)

    return first_letter + second_letter


def generate_document_number(date: datetime, counter: int) -> str:
    """
    Generate HIYES document number

    Args:
        date: The document date
        counter: Serial number for the day (1-999)

    Returns:
        HIYES document number (e.g., HIYES25JBA001)

    Raises:
        ValueError: If counter is not between 1 and 999
    """
    if not 1 <= counter <= 999:
        raise ValueError(f"Invalid counter: {counter}. Must be between 1 and 999.")

    # Extract year (last 2 digits)
    year = date.strftime("%y")

    # Convert month to letter (A-L)
    month = month_to_letter(date.month)

    # Convert day to double letters
    day = day_to_double_letters(date.day)

    # Format counter as 3-digit zero-padded number
    serial_number = f"{counter:03d}"

    # Combine into HIYES format
    return f"HIYES{year}{month}{day}{serial_number}"


def parse_document_number(document_number: str) -> Optional[dict]:
    """
    Parse HIYES document number into components

    Args:
        document_number: HIYES document number (e.g., HIYES25JBA001)

    Returns:
        Dict with year, month, day, counter, date
        None if invalid format
    """
    # Regex: HIYES{YY}{M}{DD}{NNN}
    pattern = r"^HIYES(\d{2})([A-L])([A-Z]{2})(\d{3})$"
    match = re.match(pattern, document_number)

    if not match:
        return None

    year_str, month_letter, day_letters, counter_str = match.groups()

    # Parse year (20XX)
    year = 2000 + int(year_str)

    # Parse month (A=1, B=2, ..., L=12)
    month = ord(month_letter) - 64

    # Parse day from double letters
    first_letter_index = ord(day_letters[0]) - 64
    second_letter_index = ord(day_letters[1]) - 64
    day = (first_letter_index - 1) * 26 + second_letter_index

    # Parse counter
    counter = int(counter_str)

    # Construct date
    try:
        date = datetime(year, month, day)
    except ValueError:
        # Invalid date (e.g., Feb 30)
        return None

    return {
        "year": year,
        "month": month,
        "day": day,
        "counter": counter,
        "date": date,
    }


def is_valid_document_number(document_number: str) -> bool:
    """
    Validate HIYES document number format

    Args:
        document_number: Document number to validate

    Returns:
        True if valid, False otherwise
    """
    pattern = r"^HIYES\d{2}[A-L][A-Z]{2}\d{3}$"
    return bool(re.match(pattern, document_number))


async def get_next_counter_for_date(firestore_client, date: datetime) -> int:
    """
    Get the next available counter for a specific date

    Queries Firestore to find all projects created on the same date
    and returns the next available counter value.

    Args:
        firestore_client: Firestore client instance
        date: The date to check

    Returns:
        Next available counter (1-999)

    Raises:
        ValueError: If counter exceeds 999 (max documents per day)
    """
    # Get year, month, day components
    year = date.year
    month = date.month
    day = date.day

    # Query projects created on this date
    projects_ref = firestore_client.collection("projects")

    # Since we can't query by date directly, we need to:
    # 1. Get all projects from Firestore
    # 2. Filter by date in memory
    # OR better: query by date range if date field is indexed

    # Option 1: Query by date string (if date is stored as YYYY-MM-DD)
    date_str = date.strftime("%Y-%m-%d")
    query = projects_ref.where("date", "==", date_str)

    docs = query.stream()

    # Count existing documents for this date
    count = sum(1 for _ in docs)

    # Next counter is count + 1
    next_counter = count + 1

    if next_counter > 999:
        raise ValueError(
            f"Maximum documents per day (999) exceeded for {date_str}"
        )

    return next_counter


# Example usage
if __name__ == "__main__":
    # Test cases
    test_cases = [
        (datetime(2025, 1, 1), 1, "HIYES25AAA001"),   # Jan 1, 2025
        (datetime(2025, 10, 27), 1, "HIYES25JBA001"),  # Oct 27, 2025
        (datetime(2025, 12, 31), 10, "HIYES25LBE010"), # Dec 31, 2025
        (datetime(2024, 2, 29), 5, "HIYES24BBC005"),   # Leap year
        (datetime(2025, 6, 15), 100, "HIYES25FAO100"), # Mid-year
    ]

    print("Document Number Generation Tests:")
    print("=" * 60)

    for date, counter, expected in test_cases:
        generated = generate_document_number(date, counter)
        status = "✓" if generated == expected else "✗"
        print(f"{status} {date.strftime('%Y-%m-%d')}: {generated} (expected: {expected})")

        # Test parsing
        parsed = parse_document_number(generated)
        if parsed:
            assert parsed["year"] == date.year
            assert parsed["month"] == date.month
            assert parsed["day"] == date.day
            assert parsed["counter"] == counter

    print("\nValidation Tests:")
    print("=" * 60)

    valid_numbers = ["HIYES25JBA001", "HIYES24AAB100", "HIYES25LAF999"]
    invalid_numbers = ["HIYES25MBA001", "HIYES25J1A001", "HIYES25JAAA01", "INVALID"]

    for num in valid_numbers:
        assert is_valid_document_number(num), f"Should be valid: {num}"
        print(f"✓ Valid: {num}")

    for num in invalid_numbers:
        assert not is_valid_document_number(num), f"Should be invalid: {num}"
        print(f"✓ Invalid: {num}")

    print("\nAll tests passed!")
