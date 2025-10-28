#!/usr/bin/env python3
"""
Test Data Seeder for AutoDocGen
Seeds Firebase Emulator with sample data for testing
"""

import firebase_admin
from firebase_admin import credentials, firestore, storage
from datetime import datetime
import sys
import os

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_color(color, message):
    print(f"{color}{message}{Colors.END}")

def print_success(message):
    print_color(Colors.GREEN, f"✓ {message}")

def print_info(message):
    print_color(Colors.BLUE, f"ℹ {message}")

def print_error(message):
    print_color(Colors.RED, f"✗ {message}")

def print_warning(message):
    print_color(Colors.YELLOW, f"⚠ {message}")

# Initialize Firebase Admin (for Emulator)
def init_firebase():
    """Initialize Firebase Admin SDK for Emulator"""

    # Set environment variables for emulator
    os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"
    os.environ["FIREBASE_STORAGE_EMULATOR_HOST"] = "localhost:9199"

    try:
        # Initialize without credentials (for emulator)
        firebase_admin.initialize_app(options={
            'projectId': 'autodocgen-prod',
            'storageBucket': 'autodocgen-prod.appspot.com'
        })
        print_success("Connected to Firebase Emulators")
        return firestore.client()
    except Exception as e:
        print_error(f"Failed to connect to Firebase: {e}")
        print_warning("Make sure Firebase Emulators are running: firebase emulators:start")
        sys.exit(1)

def seed_companies(db):
    """Seed sample companies"""
    print_info("Seeding companies...")

    companies = [
        {
            "company_name": "測試科技有限公司",
            "address": "台北市信義區信義路五段7號",
            "tax_id": "12345678",
            "phone": "02-2345-6789",
            "email": "info@test-tech.com",
            "website": "https://test-tech.com",
            "created_at": firestore.SERVER_TIMESTAMP,
            "created_by": "test-user",
            "updated_at": firestore.SERVER_TIMESTAMP
        },
        {
            "company_name": "創新設計股份有限公司",
            "address": "台北市大安區敦化南路二段105號",
            "tax_id": "87654321",
            "phone": "02-8765-4321",
            "email": "hello@creative-design.com",
            "website": "https://creative-design.com",
            "created_at": firestore.SERVER_TIMESTAMP,
            "created_by": "test-user",
            "updated_at": firestore.SERVER_TIMESTAMP
        },
        {
            "company_name": "智能解決方案有限公司",
            "address": "新竹市東區光復路二段101號",
            "tax_id": "11223344",
            "phone": "03-1122-3344",
            "email": "contact@smart-solutions.com",
            "website": "https://smart-solutions.com",
            "created_at": firestore.SERVER_TIMESTAMP,
            "created_by": "test-user",
            "updated_at": firestore.SERVER_TIMESTAMP
        }
    ]

    company_ids = []
    for company in companies:
        doc_ref = db.collection('companies').add(company)
        company_ids.append(doc_ref[1].id)
        print_success(f"Created company: {company['company_name']}")

    return company_ids

def seed_contacts(db, company_ids):
    """Seed sample contacts"""
    print_info("Seeding contacts...")

    contacts = [
        # Company 1 contacts
        {
            "contact_name": "張三",
            "email": "zhang.san@test-tech.com",
            "phone": "0912-345-678",
            "position": "專案經理",
            "company_ref": f"companies/{company_ids[0]}",
            "created_at": firestore.SERVER_TIMESTAMP,
            "created_by": "test-user",
            "updated_at": firestore.SERVER_TIMESTAMP
        },
        {
            "contact_name": "李四",
            "email": "li.si@test-tech.com",
            "phone": "0923-456-789",
            "position": "技術總監",
            "company_ref": f"companies/{company_ids[0]}",
            "created_at": firestore.SERVER_TIMESTAMP,
            "created_by": "test-user",
            "updated_at": firestore.SERVER_TIMESTAMP
        },
        # Company 2 contacts
        {
            "contact_name": "王五",
            "email": "wang.wu@creative-design.com",
            "phone": "0934-567-890",
            "position": "設計主管",
            "company_ref": f"companies/{company_ids[1]}",
            "created_at": firestore.SERVER_TIMESTAMP,
            "created_by": "test-user",
            "updated_at": firestore.SERVER_TIMESTAMP
        },
        # Company 3 contacts
        {
            "contact_name": "趙六",
            "email": "zhao.liu@smart-solutions.com",
            "phone": "0945-678-901",
            "position": "業務經理",
            "company_ref": f"companies/{company_ids[2]}",
            "created_at": firestore.SERVER_TIMESTAMP,
            "created_by": "test-user",
            "updated_at": firestore.SERVER_TIMESTAMP
        }
    ]

    contact_ids = []
    for contact in contacts:
        doc_ref = db.collection('contacts').add(contact)
        contact_ids.append(doc_ref[1].id)
        print_success(f"Created contact: {contact['contact_name']} ({contact['position']})")

    return contact_ids

def seed_templates(db):
    """Seed sample templates"""
    print_info("Seeding templates...")

    templates = [
        {
            "name": "標準報價單",
            "type": "quotation",
            "description": "適用於一般專案的標準報價單模板",
            "file_path": "templates/quotation-template.docx",
            "file_name": "quotation-template.docx",
            "file_size": 50000,
            "variables": {
                "standard": [
                    "project_name",
                    "company_name",
                    "contact_name",
                    "contact_email",
                    "contact_phone",
                    "price",
                    "price_before_tax",
                    "tax_amount",
                    "date",
                    "year",
                    "month",
                    "day",
                    "document_number"
                ],
                "extra": [
                    "payment_terms",
                    "delivery_date",
                    "warranty_period"
                ]
            },
            "is_active": True,
            "created_at": firestore.SERVER_TIMESTAMP,
            "created_by": "test-user",
            "updated_at": firestore.SERVER_TIMESTAMP,
            "version": 1
        },
        {
            "name": "合約書模板",
            "type": "contract",
            "description": "適用於正式合約的模板",
            "file_path": "templates/contract-template.docx",
            "file_name": "contract-template.docx",
            "file_size": 75000,
            "variables": {
                "standard": [
                    "project_name",
                    "company_name",
                    "company_address",
                    "company_tax_id",
                    "contact_name",
                    "price",
                    "date",
                    "document_number"
                ],
                "extra": [
                    "contract_period",
                    "payment_schedule",
                    "termination_clause",
                    "confidentiality_terms"
                ]
            },
            "is_active": True,
            "created_at": firestore.SERVER_TIMESTAMP,
            "created_by": "test-user",
            "updated_at": firestore.SERVER_TIMESTAMP,
            "version": 1
        },
        {
            "name": "發票模板",
            "type": "invoice",
            "description": "標準發票模板",
            "file_path": "templates/invoice-template.docx",
            "file_name": "invoice-template.docx",
            "file_size": 45000,
            "variables": {
                "standard": [
                    "project_name",
                    "company_name",
                    "company_address",
                    "company_tax_id",
                    "price",
                    "price_before_tax",
                    "tax_amount",
                    "date",
                    "document_number"
                ],
                "extra": [
                    "invoice_number",
                    "due_date"
                ]
            },
            "is_active": True,
            "created_at": firestore.SERVER_TIMESTAMP,
            "created_by": "test-user",
            "updated_at": firestore.SERVER_TIMESTAMP,
            "version": 1
        }
    ]

    template_ids = []
    for template in templates:
        doc_ref = db.collection('templates').add(template)
        template_ids.append(doc_ref[1].id)
        print_success(f"Created template: {template['name']} ({template['type']})")

    return template_ids

def create_sample_projects(db, company_ids, contact_ids, template_ids):
    """Create sample projects"""
    print_info("Creating sample projects...")

    projects = [
        {
            "project_name": "網站重新設計專案",
            "company_ref": f"companies/{company_ids[0]}",
            "contact_ref": f"contacts/{contact_ids[0]}",
            "price": 150000,
            "date": "2025-10-28",
            "status": "in_progress",
            "created_at": firestore.SERVER_TIMESTAMP,
            "created_by": "test-user",
            "updated_at": firestore.SERVER_TIMESTAMP,
            "status_history": [
                {
                    "status": "draft",
                    "timestamp": firestore.SERVER_TIMESTAMP,
                    "updated_by": "test-user"
                }
            ]
        },
        {
            "project_name": "品牌識別設計",
            "company_ref": f"companies/{company_ids[1]}",
            "contact_ref": f"contacts/{contact_ids[2]}",
            "price": 80000,
            "date": "2025-10-27",
            "status": "pending_invoice",
            "created_at": firestore.SERVER_TIMESTAMP,
            "created_by": "test-user",
            "updated_at": firestore.SERVER_TIMESTAMP,
            "status_history": [
                {
                    "status": "draft",
                    "timestamp": firestore.SERVER_TIMESTAMP,
                    "updated_by": "test-user"
                }
            ]
        }
    ]

    project_ids = []
    for project in projects:
        doc_ref = db.collection('projects').add(project)
        project_ids.append(doc_ref[1].id)
        print_success(f"Created project: {project['project_name']} ({project['status']})")

    return project_ids

def main():
    """Main seeding function"""
    print()
    print_color(Colors.BLUE, "=" * 60)
    print_color(Colors.BLUE, "  AutoDocGen Test Data Seeder")
    print_color(Colors.BLUE, "=" * 60)
    print()

    # Check if emulators are running
    print_info("Checking Firebase Emulators...")

    try:
        db = init_firebase()
    except Exception as e:
        print_error(f"Failed to initialize: {e}")
        sys.exit(1)

    print()

    # Seed data
    try:
        # Seed companies
        company_ids = seed_companies(db)
        print()

        # Seed contacts
        contact_ids = seed_contacts(db, company_ids)
        print()

        # Seed templates
        template_ids = seed_templates(db)
        print()

        # Create sample projects
        project_ids = create_sample_projects(db, company_ids, contact_ids, template_ids)
        print()

        # Summary
        print_color(Colors.BLUE, "=" * 60)
        print_color(Colors.GREEN, "✅ Test data seeded successfully!")
        print_color(Colors.BLUE, "=" * 60)
        print()
        print_success(f"Companies: {len(company_ids)}")
        print_success(f"Contacts: {len(contact_ids)}")
        print_success(f"Templates: {len(template_ids)}")
        print_success(f"Projects: {len(project_ids)}")
        print()
        print_info("You can view the data in Firebase Emulator UI:")
        print_info("http://localhost:4000")
        print()

    except Exception as e:
        print_error(f"Failed to seed data: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
