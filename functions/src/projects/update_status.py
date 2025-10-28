"""
Update Project Status Cloud Function
"""

from firebase_functions import https_fn
from firebase_admin import firestore


VALID_STATUSES = [
    'draft',
    'in_progress',
    'paused',
    'pending_invoice',
    'pending_payment',
    'completed'
]


@https_fn.on_call()
def update_project_status(req: https_fn.CallableRequest) -> dict:
    """
    Update project status.

    Request data:
        project_id: str
        status: str (one of VALID_STATUSES)

    Returns:
        dict with success status
    """

    if not req.auth:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.UNAUTHENTICATED,
            message='Authentication required'
        )

    project_id = req.data.get('project_id')
    new_status = req.data.get('status')

    if not project_id or not new_status:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message='project_id and status are required'
        )

    if new_status not in VALID_STATUSES:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message=f'Invalid status. Must be one of: {", ".join(VALID_STATUSES)}'
        )

    db = firestore.client()

    try:
        project_ref = db.collection('projects').document(project_id)
        project_doc = project_ref.get()

        if not project_doc.exists:
            raise https_fn.HttpsError(
                code=https_fn.FunctionsErrorCode.NOT_FOUND,
                message='Project not found'
            )

        project_data = project_doc.to_dict()

        # Check permission (user must be owner or have member access)
        created_by = project_data.get('created_by')
        shared_with = project_data.get('shared_with', {})
        user_role = shared_with.get(req.auth.uid)

        if req.auth.uid != created_by and user_role not in ['member', 'owner']:
            raise https_fn.HttpsError(
                code=https_fn.FunctionsErrorCode.PERMISSION_DENIED,
                message='You do not have permission to update this project'
            )

        # Update status
        project_ref.update({
            'status': new_status,
            'status_history': firestore.ArrayUnion([{
                'status': new_status,
                'timestamp': firestore.SERVER_TIMESTAMP,
                'updated_by': req.auth.uid
            }]),
            'updated_at': firestore.SERVER_TIMESTAMP
        })

        # Log activity
        db.collection('activities').add({
            'action': 'update_status',
            'user_id': req.auth.uid,
            'user_name': req.auth.token.get('name', 'Unknown'),
            'resource_type': 'project',
            'resource_id': project_id,
            'resource_name': project_data.get('project_name', ''),
            'details': {
                'old_status': project_data.get('status'),
                'new_status': new_status
            },
            'timestamp': firestore.SERVER_TIMESTAMP
        })

        return {
            'success': True
        }

    except https_fn.HttpsError:
        raise
    except Exception as e:
        print(f"Error updating project status: {e}")
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INTERNAL,
            message=f'Internal error: {str(e)}'
        )
