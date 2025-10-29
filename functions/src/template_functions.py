"""
Template Cloud Functions

Handle template processing and document generation
"""

import tempfile
import os
from typing import Dict, Any
from firebase_functions import https_fn, options
from firebase_admin import storage, firestore
from .document_processor import (
    extract_variables_from_docx,
    extract_variables_from_pdf,
    generate_docx,
    generate_docx_from_text,
    generate_pdf_from_text,
    generate_html
)


@https_fn.on_call(
    cors=options.CorsOptions(
        cors_origins="*",
        cors_methods=["post"]
    )
)
def extract_template_variables(req: https_fn.CallableRequest) -> Dict[str, Any]:
    """
    Extract variables from uploaded template file

    Request data:
        file_url: str - URL of uploaded template file
        file_type: str - 'docx' or 'pdf'

    Returns:
        {
            'variables': List[str] - Detected variables,
            'content': str - Extracted text content
        }
    """
    try:
        file_url = req.data.get('file_url')
        file_type = req.data.get('file_type', '').lower()

        if not file_url:
            raise https_fn.HttpsError(
                code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
                message='file_url is required'
            )

        # Download file from Storage
        bucket = storage.bucket()
        # Extract path from URL
        file_path = file_url.split(f'{bucket.name}/')[1].split('?')[0]
        blob = bucket.blob(file_path)

        # Download to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{file_type}') as tmp_file:
            blob.download_to_filename(tmp_file.name)
            tmp_path = tmp_file.name

        try:
            # Extract variables based on file type
            if file_type == 'docx' or file_type == 'doc':
                content, variables = extract_variables_from_docx(tmp_path)
            elif file_type == 'pdf':
                content, variables = extract_variables_from_pdf(tmp_path)
            else:
                raise https_fn.HttpsError(
                    code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
                    message=f'Unsupported file type: {file_type}'
                )

            return {
                'variables': variables,
                'content': content
            }

        finally:
            # Clean up temp file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except Exception as e:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INTERNAL,
            message=str(e)
        )


@https_fn.on_call(
    cors=options.CorsOptions(
        cors_origins="*",
        cors_methods=["post"]
    )
)
def generate_document(req: https_fn.CallableRequest) -> Dict[str, Any]:
    """
    Generate document from template with variable values

    Request data:
        template_id: str - Template document ID
        values: Dict[str, str] - Variable values
        output_format: str - 'docx', 'pdf', or 'html'
        output_name: str - Output filename (optional)

    Returns:
        {
            'download_url': str - URL to download generated document,
            'file_name': str - Generated filename
        }
    """
    try:
        template_id = req.data.get('template_id')
        values = req.data.get('values', {})
        output_format = req.data.get('output_format', 'pdf').lower()
        output_name = req.data.get('output_name', 'generated_document')

        if not template_id:
            raise https_fn.HttpsError(
                code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
                message='template_id is required'
            )

        # Get template from Firestore
        db = firestore.client()
        template_ref = db.collection('templates').document(template_id)
        template_doc = template_ref.get()

        if not template_doc.exists:
            raise https_fn.HttpsError(
                code=https_fn.FunctionsErrorCode.NOT_FOUND,
                message='Template not found'
            )

        template_data = template_doc.to_dict()
        source_type = template_data.get('source_type', 'text')
        bucket = storage.bucket()

        # Ensure output_name has correct extension
        if not output_name.endswith(f'.{output_format}'):
            output_name = f'{output_name}.{output_format}'

        # Generate document based on source type
        with tempfile.TemporaryDirectory() as tmp_dir:
            output_path = os.path.join(tmp_dir, output_name)

            if source_type == 'file':
                # Template from uploaded file
                file_url = template_data.get('file_url')
                file_name = template_data.get('file_name', '')
                file_ext = file_name.split('.')[-1].lower()

                # Download template file
                file_path = file_url.split(f'{bucket.name}/')[1].split('?')[0]
                blob = bucket.blob(file_path)
                template_path = os.path.join(tmp_dir, f'template.{file_ext}')
                blob.download_to_filename(template_path)

                # Generate based on output format
                if output_format == 'docx' and file_ext in ['docx', 'doc']:
                    generate_docx(template_path, values, output_path)
                elif output_format == 'pdf':
                    # For now, extract text and generate PDF
                    if file_ext in ['docx', 'doc']:
                        content, _ = extract_variables_from_docx(template_path)
                    else:
                        content, _ = extract_variables_from_pdf(template_path)
                    generate_pdf_from_text(content, values, output_path)
                elif output_format == 'html':
                    # Extract text and generate HTML
                    if file_ext in ['docx', 'doc']:
                        content, _ = extract_variables_from_docx(template_path)
                    else:
                        content, _ = extract_variables_from_pdf(template_path)
                    html_content = generate_html(content, values)
                    with open(output_path, 'w', encoding='utf-8') as f:
                        f.write(html_content)
                else:
                    raise https_fn.HttpsError(
                        code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
                        message=f'Unsupported output format: {output_format}'
                    )

            else:
                # Template from text content
                content = template_data.get('content', '')

                if output_format == 'docx':
                    generate_docx_from_text(content, values, output_path)
                elif output_format == 'pdf':
                    generate_pdf_from_text(content, values, output_path)
                elif output_format == 'html':
                    html_content = generate_html(content, values)
                    with open(output_path, 'w', encoding='utf-8') as f:
                        f.write(html_content)
                else:
                    raise https_fn.HttpsError(
                        code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
                        message=f'Unsupported output format: {output_format}'
                    )

            # Upload generated document to Storage
            output_blob_path = f'generated/{template_id}/{output_name}'
            output_blob = bucket.blob(output_blob_path)
            output_blob.upload_from_filename(output_path)

            # Make it publicly accessible (or use signed URL)
            output_blob.make_public()
            download_url = output_blob.public_url

            return {
                'download_url': download_url,
                'file_name': output_name
            }

    except Exception as e:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INTERNAL,
            message=str(e)
        )
