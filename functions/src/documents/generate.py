"""
Document Generation Cloud Function

Main function for generating Word documents from templates.
"""

from firebase_functions import https_fn
from firebase_admin import firestore, storage
from docx import Document
from datetime import datetime
import tempfile
import os
import uuid

from .placeholders import replace_placeholders
from ..projects.variables import prepare_standard_variables


@https_fn.on_call()
def generate_documents(req: https_fn.CallableRequest) -> dict:
    """
    Generate documents from templates for a project.

    Request data:
        project_id: str - Project ID
        template_ids: list[str] - List of template IDs to generate

    Returns:
        dict with:
            success: bool
            document_ids: list[str]
            failed_templates: list[dict] (if any failures)
    """

    # Verify authentication
    if not req.auth:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.UNAUTHENTICATED,
            message='Authentication required'
        )

    # Get request data
    project_id = req.data.get('project_id')
    template_ids = req.data.get('template_ids', [])

    if not project_id:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message='project_id is required'
        )

    if not template_ids:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message='template_ids is required'
        )

    # Initialize Firestore and Storage
    db = firestore.client()
    bucket = storage.bucket()

    try:
        # Get project data
        project_ref = db.collection('projects').document(project_id)
        project_doc = project_ref.get()

        if not project_doc.exists:
            raise https_fn.HttpsError(
                code=https_fn.FunctionsErrorCode.NOT_FOUND,
                message='Project not found'
            )

        project_data = project_doc.to_dict()

        # Get company and contact data
        company_ref = db.document(project_data['company_ref'])
        contact_ref = db.document(project_data['contact_ref'])

        company_data = company_ref.get().to_dict()
        contact_data = contact_ref.get().to_dict()

        # Prepare standard variables
        standard_vars = prepare_standard_variables(
            project_data,
            company_data,
            contact_data,
            db
        )

        # Generate documents for each template
        generated_docs = []
        failed_templates = []

        for template_id in template_ids:
            try:
                doc_info = generate_single_document(
                    db=db,
                    bucket=bucket,
                    project_id=project_id,
                    project_data=project_data,
                    template_id=template_id,
                    standard_vars=standard_vars,
                    user_id=req.auth.uid
                )
                generated_docs.append(doc_info)

            except Exception as e:
                print(f"Error generating document for template {template_id}: {e}")
                failed_templates.append({
                    'template_id': template_id,
                    'error': str(e)
                })

        # Update project with generated documents
        if generated_docs:
            project_ref.update({
                'generated_docs': firestore.ArrayUnion(generated_docs),
                'updated_at': firestore.SERVER_TIMESTAMP
            })

        # Log activity
        db.collection('activities').add({
            'action': 'generate_documents',
            'user_id': req.auth.uid,
            'user_name': req.auth.token.get('name', 'Unknown'),
            'resource_type': 'project',
            'resource_id': project_id,
            'resource_name': project_data.get('project_name', ''),
            'details': {
                'template_count': len(template_ids),
                'generated_count': len(generated_docs),
                'failed_count': len(failed_templates)
            },
            'timestamp': firestore.SERVER_TIMESTAMP
        })

        return {
            'success': True,
            'document_ids': [doc['id'] for doc in generated_docs],
            'documents': generated_docs,
            'failed_templates': failed_templates if failed_templates else None
        }

    except https_fn.HttpsError:
        raise
    except Exception as e:
        print(f"Error in generate_documents: {e}")
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INTERNAL,
            message=f'Internal error: {str(e)}'
        )


def generate_single_document(
    db,
    bucket,
    project_id: str,
    project_data: dict,
    template_id: str,
    standard_vars: dict,
    user_id: str
) -> dict:
    """
    Generate a single document from a template.

    Returns:
        dict with document metadata
    """

    # Get template data
    template_ref = db.collection('templates').document(template_id)
    template_doc = template_ref.get()

    if not template_doc.exists:
        raise Exception(f"Template {template_id} not found")

    template_data = template_doc.to_dict()

    # Merge standard variables with extra data for this template
    extra_data = project_data.get('extra_data', {}).get(template_id, {})
    all_vars = {**standard_vars, **extra_data}

    # Download template from Storage
    template_path = template_data['file_path']
    template_blob = bucket.blob(template_path)

    with tempfile.NamedTemporaryFile(suffix='.docx', delete=False) as temp_template:
        template_blob.download_to_filename(temp_template.name)
        template_file = temp_template.name

    try:
        # Load and process document
        doc = Document(template_file)
        replace_placeholders(doc, all_vars)

        # Save processed document
        with tempfile.NamedTemporaryFile(suffix='.docx', delete=False) as temp_output:
            doc.save(temp_output.name)
            output_file = temp_output.name

        try:
            # Generate output filename
            project_name = project_data.get('project_name', 'Project')
            template_name = template_data.get('name', 'Document')
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_filename = f"{project_name}_{template_name}_{timestamp}.docx"

            # Upload to Storage
            output_path = f"documents/{project_id}/{template_id}_{timestamp}.docx"
            output_blob = bucket.blob(output_path)
            output_blob.upload_from_filename(output_file)

            # Make it accessible (according to storage rules)
            file_url = f"gs://{bucket.name}/{output_path}"

            # Get file size
            file_size = os.path.getsize(output_file)

            # Create document metadata
            doc_info = {
                'id': f"DOC-{uuid.uuid4().hex[:8]}",
                'template_id': template_id,
                'template_name': template_data.get('name', ''),
                'file_url': file_url,
                'file_path': output_path,
                'file_name': output_filename,
                'file_size': file_size,
                'created_at': firestore.SERVER_TIMESTAMP,
                'created_by': user_id,
                'generation_data': all_vars
            }

            return doc_info

        finally:
            # Clean up output file
            os.unlink(output_file)

    finally:
        # Clean up template file
        os.unlink(template_file)
