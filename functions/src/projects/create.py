"""
Create Project Cloud Function
"""

from firebase_functions import https_fn
from firebase_admin import firestore


@https_fn.on_call()
def create_project(req: https_fn.CallableRequest) -> dict:
    """
    Create a new project.

    Request data:
        project_name: str
        company_ref: str (Firestore path)
        contact_ref: str (Firestore path)
        price: float
        date: str (YYYY-MM-DD)
        extra_data: dict (optional)

    Returns:
        dict with success and project_id
    """

    if not req.auth:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.UNAUTHENTICATED,
            message='Authentication required'
        )

    # Get and validate data
    data = req.data

    required_fields = ['project_name', 'company_ref', 'contact_ref', 'price', 'date']
    for field in required_fields:
        if field not in data:
            raise https_fn.HttpsError(
                code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
                message=f'{field} is required'
            )

    # Validate price
    try:
        price = float(data['price'])
        if price <= 0:
            raise ValueError()
    except (ValueError, TypeError):
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message='price must be a positive number'
        )

    db = firestore.client()

    try:
        # Create project document
        project_ref = db.collection('projects').document()

        project_data = {
            'project_name': data['project_name'],
            'company_ref': data['company_ref'],
            'contact_ref': data['contact_ref'],
            'price': price,
            'date': data['date'],
            'status': 'draft',
            'status_history': [{
                'status': 'draft',
                'timestamp': firestore.SERVER_TIMESTAMP,
                'updated_by': req.auth.uid
            }],
            'generated_docs': [],
            'extra_data': data.get('extra_data', {}),
            'created_by': req.auth.uid,
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP,
            'shared_with': {}
        }

        project_ref.set(project_data)

        # Log activity
        db.collection('activities').add({
            'action': 'create_project',
            'user_id': req.auth.uid,
            'user_name': req.auth.token.get('name', 'Unknown'),
            'resource_type': 'project',
            'resource_id': project_ref.id,
            'resource_name': data['project_name'],
            'timestamp': firestore.SERVER_TIMESTAMP
        })

        return {
            'success': True,
            'project_id': project_ref.id
        }

    except Exception as e:
        print(f"Error creating project: {e}")
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INTERNAL,
            message=f'Internal error: {str(e)}'
        )
