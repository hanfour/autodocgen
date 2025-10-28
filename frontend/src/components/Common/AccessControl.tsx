import React, { useEffect, useState } from 'react';
import { useShare, type AccessRole } from '../../hooks/useShare';

interface AccessControlProps {
  children: React.ReactNode;
  resourceType: 'project' | 'template' | 'company' | 'contact';
  resourceId: string;
  currentUserId: string;
  requiredRole: AccessRole;
  fallback?: React.ReactNode;
}

/**
 * AccessControl - Conditional rendering based on user permissions
 *
 * Only renders children if the current user has the required access level
 *
 * Usage:
 * ```tsx
 * <AccessControl
 *   resourceType="project"
 *   resourceId={projectId}
 *   currentUserId={currentUser.uid}
 *   requiredRole="member"
 *   fallback={<div>You don't have permission to edit this project</div>}
 * >
 *   <button onClick={handleEdit}>Edit Project</button>
 * </AccessControl>
 * ```
 */
const AccessControl: React.FC<AccessControlProps> = ({
  children,
  resourceType,
  resourceId,
  currentUserId,
  requiredRole,
  fallback = null,
}) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const { checkAccess } = useShare({
    resourceType,
    resourceId,
  });

  useEffect(() => {
    const verifyAccess = async () => {
      setLoading(true);
      const access = await checkAccess(currentUserId, requiredRole);
      setHasAccess(access);
      setLoading(false);
    };

    verifyAccess();
  }, [resourceType, resourceId, currentUserId, requiredRole, checkAccess]);

  if (loading) {
    return null; // or return a loading spinner
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default AccessControl;
