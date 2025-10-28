"""
Standard Variables Preparation

Prepares standard variables from project, company, and contact data.
"""

from datetime import datetime
from typing import Dict, Any
from ..utils.document_number import generate_document_number, get_next_counter_for_date


def prepare_standard_variables(
    project: Dict[str, Any],
    company: Dict[str, Any],
    contact: Dict[str, Any],
    db_client
) -> Dict[str, str]:
    """
    Prepare standard variables for document generation.

    Standard variables include:
    - project_name, company_name, contact_name
    - price, price_before_tax, tax_amount
    - date, year, month, day (both ROC and Western calendar)
    - quotation_number, contract_number, invoice_number
    - contact_info (name + phone)

    Args:
        project: Project data from Firestore
        company: Company data from Firestore
        contact: Contact data from Firestore
        db_client: Firestore client for counter queries

    Returns:
        Dictionary of standard variables
    """

    # Parse project date
    date_str = project.get('date', '')
    try:
        date = datetime.strptime(date_str, '%Y-%m-%d')
    except ValueError:
        date = datetime.now()

    # Calculate tax (assuming 5% tax rate)
    price = float(project.get('price', 0))
    tax_rate = 0.05
    price_before_tax = price / (1 + tax_rate)
    tax_amount = price - price_before_tax

    # Generate document number
    try:
        counter = get_next_counter_for_date(db_client, date)
        document_number = generate_document_number(date, counter)
    except Exception as e:
        print(f"Error generating document number: {e}")
        document_number = "HIYES00AAA001"  # Fallback

    # ROC (Taiwan) calendar conversion
    roc_year = date.year - 1911

    # Contact info (name + phone if available)
    contact_phone = contact.get('phone', '')
    contact_info = contact.get('contact_name', '')
    if contact_phone:
        contact_info = f"{contact_info} ({contact_phone})"

    # Prepare standard variables
    variables = {
        # Basic info
        'project_name': project.get('project_name', ''),
        'company_name': company.get('company_name', ''),
        'contact_name': contact.get('contact_name', ''),

        # Financial
        'price': f"{price:,.2f}",
        'price_before_tax': f"{price_before_tax:,.2f}",
        'tax_amount': f"{tax_amount:,.2f}",

        # Dates (Western calendar)
        'date': date.strftime('%Y-%m-%d'),
        'year': str(date.year),
        'month': f"{date.month:02d}",
        'day': f"{date.day:02d}",

        # Dates (ROC calendar)
        'roc_year': str(roc_year),
        'roc_date': f"{roc_year}/{date.month:02d}/{date.day:02d}",

        # Document numbers
        'document_number': document_number,
        'quotation_number': document_number,
        'contract_number': document_number,
        'invoice_number': document_number,

        # Additional info
        'contact_info': contact_info,
        'contact_email': contact.get('email', ''),
        'contact_phone': contact_phone,
        'company_address': company.get('address', ''),

        # Timestamps
        'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'updated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
    }

    return variables
