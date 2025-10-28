import React, { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, Check } from 'lucide-react';
import { useShare, type AccessRole, type ShareUser } from '../../hooks/useShare';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resourceType: 'project' | 'template' | 'company' | 'contact';
  resourceId: string;
  resourceName: string;
  onShareUpdate?: () => void;
}

const ShareDialog: React.FC<ShareDialogProps> = ({
  isOpen,
  onClose,
  resourceType,
  resourceId,
  resourceName,
  onShareUpdate,
}) => {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<AccessRole>('viewer');
  const [sharedUsers, setSharedUsers] = useState<ShareUser[]>([]);
  const [success, setSuccess] = useState('');

  const {
    loading,
    error: hookError,
    getSharedUsers,
    shareWithUser,
    updateUserRole,
    removeUser,
  } = useShare({
    resourceType,
    resourceId,
    onUpdate: onShareUpdate,
  });

  const [error, setError] = useState('');

  // Sync hook error to local error state
  useEffect(() => {
    if (hookError) {
      setError(hookError);
    }
  }, [hookError]);

  // Fetch current shared users
  useEffect(() => {
    if (isOpen) {
      fetchSharedUsers();
    }
  }, [isOpen, resourceId]);

  const fetchSharedUsers = async () => {
    const users = await getSharedUsers();
    setSharedUsers(users);
  };

  const handleAddUser = async () => {
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setSuccess('');

    const success = await shareWithUser(email.trim(), selectedRole);

    if (success) {
      setSuccess(`Successfully shared with ${email}`);
      setEmail('');
      setSelectedRole('viewer');

      // Refresh shared users list
      await fetchSharedUsers();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    setError('');

    const success = await removeUser(userId);

    if (success) {
      // Refresh shared users list
      await fetchSharedUsers();
    }
  };

  const handleChangeRole = async (userId: string, newRole: AccessRole) => {
    setError('');

    const success = await updateUserRole(userId, newRole);

    if (success) {
      // Refresh shared users list
      await fetchSharedUsers();
    }
  };


  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '600px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Share {resourceType}</h2>
            <p className="text-sm text-gray-600 mt-1">{resourceName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Add User Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share with
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddUser()}
                placeholder="Enter email address"
                className="input flex-1"
                disabled={loading}
              />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as AccessRole)}
                className="input w-32"
                disabled={loading}
              >
                <option value="viewer">Viewer</option>
                <option value="member">Member</option>
                <option value="owner">Owner</option>
              </select>
              <button
                onClick={handleAddUser}
                disabled={loading || !email.trim()}
                className="btn-primary flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Role Descriptions */}
            <div className="mt-3 text-xs text-gray-500 space-y-1">
              <div className="flex items-center gap-2">
                <span className="badge badge-draft">Viewer</span>
                <span>Can only view</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge badge-in-progress">Member</span>
                <span>Can edit and view</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge bg-primary-100 text-primary-800">Owner</span>
                <span>Full control - can delete</span>
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg text-error-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-success-50 border border-success-200 rounded-lg text-success-700 text-sm flex items-center gap-2">
              <Check className="w-4 h-4" />
              {success}
            </div>
          )}

          {/* Shared Users List */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              People with access ({sharedUsers.length})
            </h3>

            {loading && sharedUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="spinner mx-auto mb-2"></div>
                Loading...
              </div>
            ) : sharedUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No one has access yet. Add people above to share.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                {sharedUsers.map((user) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {user.displayName || user.email}
                      </div>
                      {user.displayName && (
                        <div className="text-sm text-gray-500">{user.email}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleChangeRole(
                            user.userId!,
                            e.target.value as AccessRole
                          )
                        }
                        className="input input-sm"
                        disabled={loading}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="member">Member</option>
                        <option value="owner">Owner</option>
                      </select>

                      <button
                        onClick={() => handleRemoveUser(user.userId!)}
                        disabled={loading}
                        className="p-2 text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                        title="Remove access"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button onClick={onClose} className="btn-secondary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareDialog;
