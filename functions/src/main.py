"""
AutoDocGen Cloud Functions - Main Entry Point

This module contains all Cloud Functions for the AutoDocGen platform.
"""

from firebase_functions import https_fn
from firebase_admin import initialize_app, firestore, storage
import os

# Initialize Firebase Admin
initialize_app()

# Import Cloud Functions
from .documents.generate import generate_documents
from .documents.regenerate import regenerate_document
from .templates.analyze import analyze_template
from .projects.create import create_project
from .projects.update_status import update_project_status

# Export functions
__all__ = [
    'generate_documents',
    'regenerate_document',
    'analyze_template',
    'create_project',
    'update_project_status',
]
