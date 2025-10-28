# Permissions and Sharing Guide

## Overview

AutoDocGen implements a comprehensive three-tier access control system for all resources (projects, templates, companies, contacts). This guide explains how the permission system works and how to use it in the application.

## Access Levels

### Viewer
- **Can**: Read/view the resource
- **Cannot**: Edit or delete
- **Use case**: Clients, external stakeholders who need read-only access

### Member
- **Can**: Read and edit the resource
- **Cannot**: Delete or change ownership
- **Use case**: Team members who actively work on projects

### Owner
- **Can**: Full control (read, edit, delete, manage sharing)
- **Cannot**: Nothing - has complete access
- **Use case**: Project manager, resource creator

## Role Hierarchy

```
Owner (Level 3)
  ├─ All member permissions
  └─ Delete resource

Member (Level 2)
  ├─ All viewer permissions
  └─ Edit resource

Viewer (Level 1)
  └─ View resource only
```

## Components

### 1. ShareDialog

Main component for managing resource sharing.

**Props**:
```typescript
interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resourceType: 'project' | 'template' | 'company' | 'contact';
  resourceId: string;
  resourceName: string;
  currentUserId: string;
  onShareUpdate?: () => void;
}
```

**Example Usage**:
```tsx
import ShareDialog from '@/components/Common/ShareDialog';

function ProjectDetail({ project, currentUser }) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setShareDialogOpen(true)}>
        Share Project
      </button>

      <ShareDialog
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        resourceType="project"
        resourceId={project.id}
        resourceName={project.project_name}
        currentUserId={currentUser.uid}
        onShareUpdate={() => refetchProject()}
      />
    </div>
  );
}
```

**Features**:
- ✅ Email-based user lookup
- ✅ Role selection (owner/member/viewer)
- ✅ Add/remove users
- ✅ Change user roles
- ✅ Real-time error handling
- ✅ Success notifications
- ✅ User-friendly interface

### 2. ShareButton

Convenient wrapper component that combines a button with ShareDialog.

**Props**:
```typescript
interface ShareButtonProps {
  resourceType: 'project' | 'template' | 'company' | 'contact';
  resourceId: string;
  resourceName: string;
  currentUserId: string;
  onShareUpdate?: () => void;
  variant?: 'primary' | 'secondary' | 'icon';
  className?: string;
}
```

**Example Usage**:
```tsx
import ShareButton from '@/components/Common/ShareButton';

// Primary button style
<ShareButton
  resourceType="project"
  resourceId={project.id}
  resourceName={project.project_name}
  currentUserId={currentUser.uid}
  variant="primary"
/>

// Icon-only button
<ShareButton
  resourceType="template"
  resourceId={template.id}
  resourceName={template.name}
  currentUserId={currentUser.uid}
  variant="icon"
/>
```

### 3. AccessControl

Conditional rendering component based on permissions.

**Props**:
```typescript
interface AccessControlProps {
  children: React.ReactNode;
  resourceType: 'project' | 'template' | 'company' | 'contact';
  resourceId: string;
  currentUserId: string;
  requiredRole: AccessRole;
  fallback?: React.ReactNode;
}
```

**Example Usage**:
```tsx
import AccessControl from '@/components/Common/AccessControl';

// Show edit button only to members and owners
<AccessControl
  resourceType="project"
  resourceId={project.id}
  currentUserId={currentUser.uid}
  requiredRole="member"
>
  <button onClick={handleEdit}>Edit Project</button>
</AccessControl>

// Show delete button only to owners
<AccessControl
  resourceType="project"
  resourceId={project.id}
  currentUserId={currentUser.uid}
  requiredRole="owner"
  fallback={<p>Only owners can delete projects</p>}
>
  <button onClick={handleDelete} className="btn-danger">
    Delete Project
  </button>
</AccessControl>
```

## Hooks

### useShare

Custom hook for all sharing operations.

**API**:
```typescript
const {
  loading,
  error,
  findUserByEmail,
  getSharedUsers,
  shareWithUser,
  updateUserRole,
  removeUser,
  checkAccess,
} = useShare({
  resourceType: 'project',
  resourceId: 'project-123',
  onUpdate: () => console.log('Updated'),
});
```

**Methods**:

#### `findUserByEmail(email: string): Promise<ShareUser | null>`
Find a user by email address.

```tsx
const user = await findUserByEmail('user@example.com');
if (user) {
  console.log(`Found user: ${user.displayName}`);
}
```

#### `getSharedUsers(): Promise<ShareUser[]>`
Get all users with access to the resource.

```tsx
const users = await getSharedUsers();
console.log(`${users.length} users have access`);
```

#### `shareWithUser(email: string, role: AccessRole): Promise<boolean>`
Share resource with a user by email.

```tsx
const success = await shareWithUser('user@example.com', 'member');
if (success) {
  console.log('Resource shared successfully');
}
```

#### `updateUserRole(userId: string, newRole: AccessRole): Promise<boolean>`
Update a user's access role.

```tsx
const success = await updateUserRole('user-123', 'owner');
```

#### `removeUser(userId: string): Promise<boolean>`
Remove a user's access.

```tsx
const success = await removeUser('user-123');
```

#### `checkAccess(currentUserId: string, requiredRole: AccessRole): Promise<boolean>`
Check if a user has the required access level.

```tsx
const canEdit = await checkAccess(currentUser.uid, 'member');
if (canEdit) {
  // Show edit UI
}
```

## Data Structure

### Firestore Document

Resources store sharing information in a `shared_with` map:

```json
{
  "id": "project-123",
  "project_name": "Website Redesign",
  "created_by": "user-owner-id",
  "shared_with": {
    "user-member-1": "member",
    "user-viewer-1": "viewer",
    "user-owner-2": "owner"
  },
  "created_at": "2025-10-28T10:00:00Z",
  "updated_at": "2025-10-28T14:30:00Z"
}
```

### Users Collection

```json
{
  "id": "user-123",
  "email": "user@example.com",
  "displayName": "John Doe",
  "created_at": "2025-10-01T09:00:00Z"
}
```

## Security Rules

### Firestore Rules

```javascript
// Projects
match /projects/{projectId} {
  allow read: if isAuthenticated() && hasAccess(resource, 'viewer');
  allow create: if isAuthenticated();
  allow update: if isAuthenticated() && hasAccess(resource, 'member');
  allow delete: if isAuthenticated() && hasAccess(resource, 'owner');
}

// Helper function
function hasAccess(resource, requiredRole) {
  let userRole = resource.data.shared_with[request.auth.uid];
  return isOwner(resource) ||
         (userRole != null &&
          (requiredRole == 'viewer' ||
           (requiredRole == 'member' && userRole in ['member', 'owner']) ||
           (requiredRole == 'owner' && userRole == 'owner')));
}
```

## Common Patterns

### Pattern 1: Project Detail Page

```tsx
function ProjectDetail() {
  const { projectId } = useParams();
  const { currentUser } = useAuth();
  const [project, setProject] = useState(null);

  return (
    <div>
      <h1>{project?.project_name}</h1>

      {/* Share button - visible to all with access */}
      <ShareButton
        resourceType="project"
        resourceId={projectId}
        resourceName={project.project_name}
        currentUserId={currentUser.uid}
      />

      {/* Edit button - only members and owners */}
      <AccessControl
        resourceType="project"
        resourceId={projectId}
        currentUserId={currentUser.uid}
        requiredRole="member"
      >
        <button onClick={handleEdit}>Edit</button>
      </AccessControl>

      {/* Delete button - only owners */}
      <AccessControl
        resourceType="project"
        resourceId={projectId}
        currentUserId={currentUser.uid}
        requiredRole="owner"
      >
        <button onClick={handleDelete} className="btn-danger">
          Delete
        </button>
      </AccessControl>
    </div>
  );
}
```

### Pattern 2: Conditional Features

```tsx
function ProjectActions({ project, currentUser }) {
  const { checkAccess } = useShare({
    resourceType: 'project',
    resourceId: project.id,
  });

  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      const edit = await checkAccess(currentUser.uid, 'member');
      const del = await checkAccess(currentUser.uid, 'owner');
      setCanEdit(edit);
      setCanDelete(del);
    };
    checkPermissions();
  }, [project.id, currentUser.uid]);

  return (
    <div>
      {canEdit && <button onClick={handleEdit}>Edit</button>}
      {canDelete && <button onClick={handleDelete}>Delete</button>}
    </div>
  );
}
```

### Pattern 3: Programmatic Sharing

```tsx
function InviteTeamMember({ projectId }) {
  const { shareWithUser } = useShare({
    resourceType: 'project',
    resourceId: projectId,
  });

  const handleInvite = async (email: string) => {
    const success = await shareWithUser(email, 'member');

    if (success) {
      // Send email notification
      await sendInvitationEmail(email, projectId);
      toast.success(`Invited ${email} to the project`);
    } else {
      toast.error('User not found. They may need to create an account first.');
    }
  };

  return (
    <InvitationForm onSubmit={handleInvite} />
  );
}
```

## User Workflow

### Sharing a Project

1. **Owner opens project**
2. **Clicks "Share" button**
3. **ShareDialog opens**
4. **Owner enters team member's email**
5. **Selects role (member)**
6. **Clicks "Add"**
7. **System looks up user by email**
8. **Updates Firestore `shared_with` map**
9. **Team member can now access the project**

### Accessing Shared Resource

1. **User logs in**
2. **Views project list**
3. **Projects where `shared_with[user.uid]` exists are visible**
4. **Security Rules enforce read/write permissions**
5. **UI conditionally shows edit/delete buttons**

## Best Practices

### 1. Always Check Permissions

```tsx
// ❌ Bad - No permission check
<button onClick={handleDelete}>Delete</button>

// ✅ Good - Permission-based rendering
<AccessControl resourceType="project" resourceId={id} requiredRole="owner">
  <button onClick={handleDelete}>Delete</button>
</AccessControl>
```

### 2. Handle User Not Found

```tsx
const handleShare = async (email: string) => {
  const success = await shareWithUser(email, 'viewer');

  if (!success) {
    // Show helpful error message
    toast.error(
      'User not found. Please ask them to create an account first.',
      {
        action: {
          label: 'Send Invite',
          onClick: () => sendInviteEmail(email),
        },
      }
    );
  }
};
```

### 3. Refresh After Permission Changes

```tsx
<ShareButton
  resourceType="project"
  resourceId={projectId}
  resourceName={project.project_name}
  currentUserId={currentUser.uid}
  onShareUpdate={() => {
    refetchProject(); // Refresh project data
    refetchActivities(); // Refresh activity log
  }}
/>
```

### 4. Audit Trail

All sharing operations should be logged to the `activities` collection:

```typescript
// After sharing
await addActivity({
  action: 'share',
  user_id: currentUser.uid,
  user_name: currentUser.displayName,
  resource_type: 'project',
  resource_id: projectId,
  resource_name: project.project_name,
  details: {
    shared_with: email,
    role: selectedRole,
  },
});
```

## Troubleshooting

### Issue: "User not found"
**Cause**: Email doesn't exist in users collection
**Solution**: User must create an account first, or implement invitation system

### Issue: Permission denied error
**Cause**: User doesn't have required access level
**Solution**: Check `shared_with` map and ensure user has appropriate role

### Issue: Can't remove last owner
**Recommendation**: Implement validation to prevent removing all owners

```tsx
const handleRemoveUser = async (userId: string, role: AccessRole) => {
  if (role === 'owner') {
    const owners = sharedUsers.filter(u => u.role === 'owner');
    if (owners.length === 1) {
      toast.error('Cannot remove the last owner');
      return;
    }
  }
  await removeUser(userId);
};
```

## Future Enhancements

- [ ] Email invitations for users who don't have accounts
- [ ] Bulk user management (add multiple users at once)
- [ ] Permission templates (e.g., "Project Team" = specific set of users)
- [ ] Temporary access (time-limited sharing)
- [ ] Access history/audit log in UI
- [ ] Share via link (generate shareable link with permissions)
