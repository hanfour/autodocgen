# Security Rules Documentation

## Overview

AutoDocGen implements comprehensive security rules for both Firestore and Firebase Storage to ensure data protection and proper access control.

## Firestore Security Rules

### Helper Functions

#### `isAuthenticated()`
```javascript
function isAuthenticated() {
  return request.auth != null;
}
```
Checks if the user is authenticated.

#### `isOwner(resource)`
```javascript
function isOwner(resource) {
  return request.auth.uid == resource.data.created_by;
}
```
Checks if the current user is the owner (creator) of the resource.

#### `hasAccess(resource, requiredRole)`
```javascript
function hasAccess(resource, requiredRole) {
  let userRole = resource.data.shared_with[request.auth.uid];
  return isOwner(resource) ||
         (userRole != null &&
          (requiredRole == 'viewer' ||
           (requiredRole == 'member' && userRole in ['member', 'owner']) ||
           (requiredRole == 'owner' && userRole == 'owner')));
}
```
Checks if the user has the required access level:
- **viewer**: Can only read
- **member**: Can read and update
- **owner**: Full control (read, update, delete)

### Collection Rules

#### Projects Collection
```javascript
match /projects/{projectId} {
  allow read: if isAuthenticated() && hasAccess(resource, 'viewer');
  allow create: if isAuthenticated();
  allow update: if isAuthenticated() && hasAccess(resource, 'member');
  allow delete: if isAuthenticated() && hasAccess(resource, 'owner');
}
```
- **Read**: Authenticated users with at least viewer access
- **Create**: Any authenticated user
- **Update**: Authenticated users with member or owner access
- **Delete**: Only owners

#### Templates Collection
```javascript
match /templates/{templateId} {
  allow read: if isAuthenticated() && resource.data.is_active == true;
  allow create: if isAuthenticated();
  allow update: if isAuthenticated() && hasAccess(resource, 'member');
  allow delete: if isAuthenticated() && hasAccess(resource, 'owner');
}
```
- **Read**: Authenticated users can only read active templates
- **Create**: Any authenticated user
- **Update**: Users with member or owner access
- **Delete**: Only owners

#### Companies Collection
```javascript
match /companies/{companyId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated();
  allow update: if isAuthenticated() && hasAccess(resource, 'member');
  allow delete: if isAuthenticated() && hasAccess(resource, 'owner');
}
```
- **Read**: All authenticated users
- **Create**: All authenticated users
- **Update**: Users with member or owner access
- **Delete**: Only owners

#### Contacts Collection
```javascript
match /contacts/{contactId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated();
  allow update: if isAuthenticated() && hasAccess(resource, 'member');
  allow delete: if isAuthenticated() && hasAccess(resource, 'owner');
}
```
- **Read**: All authenticated users
- **Create**: All authenticated users
- **Update**: Users with member or owner access
- **Delete**: Only owners

#### Users Collection
```javascript
match /users/{userId} {
  allow read: if isAuthenticated();
  allow write: if isAuthenticated() && request.auth.uid == userId;
}
```
- **Read**: All authenticated users can read all user profiles
- **Write**: Users can only modify their own profile

#### Activities Collection
```javascript
match /activities/{activityId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated();
}
```
- **Read**: All authenticated users
- **Create**: All authenticated users
- **Update/Delete**: Not allowed (activities are immutable logs)

## Storage Security Rules

### Helper Functions

#### `isAuthenticated()`
```javascript
function isAuthenticated() {
  return request.auth != null;
}
```
Checks if the user is authenticated.

#### `hasProjectAccess(projectId)`
```javascript
function hasProjectAccess(projectId) {
  return firestore.get(/databases/(default)/documents/projects/$(projectId))
    .data.created_by == request.auth.uid ||
    firestore.get(/databases/(default)/documents/projects/$(projectId))
    .data.shared_with[request.auth.uid] != null;
}
```
Checks if the user has access to a project by verifying:
1. User is the project creator, OR
2. User is in the project's `shared_with` map

### Storage Paths

#### Templates Directory
```javascript
match /templates/{fileName} {
  allow read: if isAuthenticated();
  allow write: if isAuthenticated();
}

match /templates/{templateId}/{fileName} {
  allow read: if isAuthenticated();
  allow write: if isAuthenticated();
}
```
- All authenticated users can upload and download templates
- Supports both flat structure and nested (templateId/fileName)

#### Project Documents Directory
```javascript
match /documents/{projectId}/{allPaths=**} {
  allow read: if isAuthenticated() && hasProjectAccess(projectId);
  allow write: if isAuthenticated() && hasProjectAccess(projectId);
}
```
- Only users with project access can read/write documents
- Uses Firestore integration to verify project permissions
- Supports nested paths with `{allPaths=**}`

#### Company Logos Directory
```javascript
match /company-logos/{fileName} {
  allow read: if isAuthenticated();
  allow write: if isAuthenticated();
}
```
- All authenticated users can upload and view company logos

#### User Avatars Directory
```javascript
match /user-avatars/{fileName} {
  allow read: if isAuthenticated();
  allow write: if isAuthenticated() && request.auth.uid == fileName.split('.')[0];
}
```
- All authenticated users can view avatars
- Users can only upload/modify their own avatar
- Filename format: `{userId}.{extension}`

## Testing Security Rules

### Using Firebase Emulator

1. **Start the emulator**:
   ```bash
   firebase emulators:start --only firestore,storage
   ```

2. **Access Emulator UI**:
   Navigate to http://localhost:4000

3. **Run automated test script**:
   ```bash
   ./scripts/test_security_rules.sh
   ```

### Manual Test Scenarios

#### Firestore Tests

**Test 1: Unauthenticated Access**
```javascript
// Should fail
db.collection('projects').get()
```
Expected: Permission denied

**Test 2: Create Project**
```javascript
// Should succeed (authenticated)
db.collection('projects').add({
  project_name: 'Test Project',
  created_by: currentUser.uid,
  shared_with: {}
})
```

**Test 3: Read Shared Project**
```javascript
// User A creates project
// User A shares with User B as 'viewer'
// User B reads project
// Should succeed
```

**Test 4: Update as Viewer**
```javascript
// User has 'viewer' role
// Try to update project
// Should fail
```

**Test 5: Delete as Member**
```javascript
// User has 'member' role
// Try to delete project
// Should fail
```

**Test 6: Read Inactive Template**
```javascript
// Template with is_active = false
// Try to read
// Should fail
```

#### Storage Tests

**Test 1: Upload Template**
```javascript
// Authenticated user
storageRef.child('templates/test.docx').put(file)
// Should succeed
```

**Test 2: Access Project Document (Unauthorized)**
```javascript
// User not in shared_with
storageRef.child('documents/projectId/doc.docx').getDownloadURL()
// Should fail
```

**Test 3: Upload User Avatar**
```javascript
// User A tries to upload avatar as 'userB.jpg'
storageRef.child('user-avatars/userB.jpg').put(file)
// Should fail (not own user)
```

## Security Best Practices

### 1. Always Authenticate
All operations require authentication. Never expose data to unauthenticated users.

### 2. Role-Based Access Control
Use the three-tier access system:
- **viewer**: Read-only access
- **member**: Can edit but not delete
- **owner**: Full control

### 3. Data Validation
Validate data on the client AND in Cloud Functions before writing to Firestore.

### 4. Least Privilege Principle
Grant the minimum necessary permissions. Default to deny.

### 5. Audit Logs
All modifications are logged in the `activities` collection for audit trails.

### 6. Template Security
Only active templates (`is_active = true`) are accessible to prevent accidental use of draft/archived templates.

### 7. Project Isolation
Project documents are strictly isolated. Users can only access documents for projects they have access to.

## Common Issues and Solutions

### Issue 1: "Permission Denied" for Project Access
**Cause**: User not in `shared_with` map or not the owner
**Solution**: Ensure user is added to project's `shared_with` with appropriate role

### Issue 2: Cannot Read Template
**Cause**: Template has `is_active = false`
**Solution**: Set `is_active = true` or update rules if draft access needed

### Issue 3: Storage Access Denied
**Cause**: Firestore project document doesn't exist or user not in `shared_with`
**Solution**: Verify project exists in Firestore before uploading to Storage

### Issue 4: Cannot Upload Avatar
**Cause**: Filename doesn't match user ID
**Solution**: Ensure filename format is `{userId}.{extension}`

## Deployment

### Deploy Rules to Production
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage

# Deploy both
firebase deploy --only firestore:rules,storage
```

### Verify Deployed Rules
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (autodocgen-prod)
3. Navigate to Firestore → Rules
4. Verify the rules are deployed
5. Check the version timestamp

## References

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules Documentation](https://firebase.google.com/docs/storage/security)
- [Security Rules Testing](https://firebase.google.com/docs/rules/unit-tests)
