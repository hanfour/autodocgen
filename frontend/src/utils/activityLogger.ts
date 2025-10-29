/**
 * Activity Logger
 *
 * Logs user activities to Firestore
 */

import { addDocument } from '../firebase/firestore';
import { auth } from '../firebase/config';

export type ActivityType =
  | 'project_created'
  | 'project_updated'
  | 'project_deleted'
  | 'company_created'
  | 'company_updated'
  | 'company_deleted'
  | 'contact_created'
  | 'contact_updated'
  | 'contact_deleted'
  | 'document_generated'
  | 'user_login'
  | 'user_register'
  | 'profile_updated';

export interface ActivityData {
  type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
}

/**
 * Log an activity to Firestore
 */
export const logActivity = async (data: ActivityData): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn('Cannot log activity: no user logged in');
      return;
    }

    await addDocument('activities', {
      user_id: user.uid,
      user_email: user.email,
      user_name: user.displayName || 'Unknown',
      type: data.type,
      description: data.description,
      metadata: data.metadata || {},
      ip_address: null, // Could be added with backend API
      user_agent: navigator.userAgent,
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - activity logging should not break user flow
  }
};

/**
 * Helper functions for common activities
 */
export const ActivityLogger = {
  // Projects
  projectCreated: (projectName: string, projectId: string) =>
    logActivity({
      type: 'project_created',
      description: `創建專案：${projectName}`,
      metadata: { project_id: projectId, project_name: projectName },
    }),

  projectUpdated: (projectName: string, projectId: string) =>
    logActivity({
      type: 'project_updated',
      description: `更新專案：${projectName}`,
      metadata: { project_id: projectId, project_name: projectName },
    }),

  projectDeleted: (projectName: string, projectId: string) =>
    logActivity({
      type: 'project_deleted',
      description: `刪除專案：${projectName}`,
      metadata: { project_id: projectId, project_name: projectName },
    }),

  // Companies
  companyCreated: (companyName: string, companyId: string) =>
    logActivity({
      type: 'company_created',
      description: `創建公司：${companyName}`,
      metadata: { company_id: companyId, company_name: companyName },
    }),

  companyUpdated: (companyName: string, companyId: string) =>
    logActivity({
      type: 'company_updated',
      description: `更新公司：${companyName}`,
      metadata: { company_id: companyId, company_name: companyName },
    }),

  companyDeleted: (companyName: string, companyId: string) =>
    logActivity({
      type: 'company_deleted',
      description: `刪除公司：${companyName}`,
      metadata: { company_id: companyId, company_name: companyName },
    }),

  // Contacts
  contactCreated: (contactName: string, contactId: string) =>
    logActivity({
      type: 'contact_created',
      description: `創建聯絡人：${contactName}`,
      metadata: { contact_id: contactId, contact_name: contactName },
    }),

  contactUpdated: (contactName: string, contactId: string) =>
    logActivity({
      type: 'contact_updated',
      description: `更新聯絡人：${contactName}`,
      metadata: { contact_id: contactId, contact_name: contactName },
    }),

  contactDeleted: (contactName: string, contactId: string) =>
    logActivity({
      type: 'contact_deleted',
      description: `刪除聯絡人：${contactName}`,
      metadata: { contact_id: contactId, contact_name: contactName },
    }),

  // Documents
  documentGenerated: (projectName: string, documentType: string) =>
    logActivity({
      type: 'document_generated',
      description: `生成文檔：${projectName} - ${documentType}`,
      metadata: { project_name: projectName, document_type: documentType },
    }),

  // User
  userLogin: () =>
    logActivity({
      type: 'user_login',
      description: '用戶登入',
    }),

  userRegister: () =>
    logActivity({
      type: 'user_register',
      description: '用戶註冊',
    }),

  profileUpdated: () =>
    logActivity({
      type: 'profile_updated',
      description: '更新個人資料',
    }),
};
