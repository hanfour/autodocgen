import { useState, useCallback } from 'react';
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export type AccessRole = 'owner' | 'member' | 'viewer';

export interface ShareUser {
  userId: string;
  email: string;
  displayName?: string;
  role: AccessRole;
}

interface UseShareOptions {
  resourceType: 'project' | 'template' | 'company' | 'contact';
  resourceId: string;
  onUpdate?: () => void;
}

export const useShare = ({ resourceType, resourceId, onUpdate }: UseShareOptions) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCollectionName = (type: string): string => {
    const collections: Record<string, string> = {
      project: 'projects',
      template: 'templates',
      company: 'companies',
      contact: 'contacts',
    };
    return collections[type] || 'projects';
  };

  /**
   * Find user by email address
   */
  const findUserByEmail = useCallback(async (email: string): Promise<ShareUser | null> => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      return {
        userId: userDoc.id,
        email: userData.email,
        displayName: userData.displayName,
        role: 'viewer', // Default role
      };
    } catch (err) {
      console.error('Error finding user:', err);
      throw new Error('Failed to find user');
    }
  }, []);

  /**
   * Get all users with access to the resource
   */
  const getSharedUsers = useCallback(async (): Promise<ShareUser[]> => {
    try {
      setLoading(true);
      setError(null);

      const collectionName = getCollectionName(resourceType);
      const docRef = doc(db, collectionName, resourceId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Resource not found');
      }

      const data = docSnap.data();
      const sharedWith = data.shared_with || {};

      // Fetch user details for each shared user
      const users: ShareUser[] = await Promise.all(
        Object.entries(sharedWith).map(async ([userId, role]) => {
          try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            const userData = userDoc.data();

            return {
              userId,
              email: userData?.email || 'Unknown',
              displayName: userData?.displayName,
              role: role as AccessRole,
            };
          } catch {
            return {
              userId,
              email: 'Unknown',
              role: role as AccessRole,
            };
          }
        })
      );

      return users;
    } catch (err: any) {
      setError(err.message || 'Failed to load shared users');
      return [];
    } finally {
      setLoading(false);
    }
  }, [resourceType, resourceId]);

  /**
   * Share resource with a user by email
   */
  const shareWithUser = useCallback(
    async (email: string, role: AccessRole): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        // Find user by email
        const user = await findUserByEmail(email);

        if (!user) {
          setError('User not found. They may need to create an account first.');
          return false;
        }

        // Update shared_with map
        const collectionName = getCollectionName(resourceType);
        const docRef = doc(db, collectionName, resourceId);

        await updateDoc(docRef, {
          [`shared_with.${user.userId}`]: role,
          updated_at: new Date(),
        });

        if (onUpdate) {
          onUpdate();
        }

        return true;
      } catch (err: any) {
        setError(err.message || 'Failed to share resource');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [resourceType, resourceId, findUserByEmail, onUpdate]
  );

  /**
   * Update user's access role
   */
  const updateUserRole = useCallback(
    async (userId: string, newRole: AccessRole): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const collectionName = getCollectionName(resourceType);
        const docRef = doc(db, collectionName, resourceId);

        await updateDoc(docRef, {
          [`shared_with.${userId}`]: newRole,
          updated_at: new Date(),
        });

        if (onUpdate) {
          onUpdate();
        }

        return true;
      } catch (err: any) {
        setError(err.message || 'Failed to update role');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [resourceType, resourceId, onUpdate]
  );

  /**
   * Remove user's access
   */
  const removeUser = useCallback(
    async (userId: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const collectionName = getCollectionName(resourceType);
        const docRef = doc(db, collectionName, resourceId);

        // Setting to null removes the field in Firestore
        await updateDoc(docRef, {
          [`shared_with.${userId}`]: null,
          updated_at: new Date(),
        });

        if (onUpdate) {
          onUpdate();
        }

        return true;
      } catch (err: any) {
        setError(err.message || 'Failed to remove user');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [resourceType, resourceId, onUpdate]
  );

  /**
   * Check if current user has specific access level
   */
  const checkAccess = useCallback(
    async (currentUserId: string, requiredRole: AccessRole): Promise<boolean> => {
      try {
        const collectionName = getCollectionName(resourceType);
        const docRef = doc(db, collectionName, resourceId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          return false;
        }

        const data = docSnap.data();

        // Owner (creator) has all access
        if (data.created_by === currentUserId) {
          return true;
        }

        const userRole = data.shared_with?.[currentUserId] as AccessRole | undefined;

        if (!userRole) {
          return false;
        }

        // Role hierarchy check
        const roleHierarchy: Record<AccessRole, number> = {
          viewer: 1,
          member: 2,
          owner: 3,
        };

        return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
      } catch {
        return false;
      }
    },
    [resourceType, resourceId]
  );

  return {
    loading,
    error,
    findUserByEmail,
    getSharedUsers,
    shareWithUser,
    updateUserRole,
    removeUser,
    checkAccess,
  };
};
