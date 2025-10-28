// Firebase Storage Helper Functions
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata,
  StorageReference,
  UploadResult,
  UploadTask,
  FullMetadata,
} from 'firebase/storage';
import { storage } from './config';

/**
 * Storage paths
 */
export const storagePaths = {
  templates: 'templates',
  documents: 'documents',
  companyLogos: 'company-logos',
  userAvatars: 'user-avatars',
} as const;

/**
 * Upload a file to Firebase Storage
 */
export const uploadFile = async (
  path: string,
  file: File,
  metadata?: Record<string, string>
): Promise<UploadResult> => {
  try {
    const storageRef = ref(storage, path);
    const customMetadata = metadata
      ? {
          customMetadata: {
            ...metadata,
            uploadedAt: new Date().toISOString(),
          },
        }
      : undefined;

    return await uploadBytes(storageRef, file, customMetadata);
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Upload a file with progress tracking
 */
export const uploadFileWithProgress = (
  path: string,
  file: File,
  onProgress?: (progress: number) => void,
  metadata?: Record<string, string>
): UploadTask => {
  const storageRef = ref(storage, path);
  const customMetadata = metadata
    ? {
        customMetadata: {
          ...metadata,
          uploadedAt: new Date().toISOString(),
        },
      }
    : undefined;

  const uploadTask = uploadBytesResumable(storageRef, file, customMetadata);

  if (onProgress) {
    uploadTask.on('state_changed', (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      onProgress(progress);
    });
  }

  return uploadTask;
};

/**
 * Get download URL for a file
 */
export const getFileURL = async (path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
};

/**
 * Delete a file from Storage
 */
export const deleteFile = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * List all files in a directory
 */
export const listFiles = async (path: string): Promise<StorageReference[]> => {
  try {
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    return result.items;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

/**
 * Get file metadata
 */
export const getFileMetadata = async (path: string): Promise<FullMetadata> => {
  try {
    const storageRef = ref(storage, path);
    return await getMetadata(storageRef);
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw error;
  }
};

/**
 * Update file metadata
 */
export const updateFileMetadata = async (
  path: string,
  metadata: Record<string, string>
): Promise<FullMetadata> => {
  try {
    const storageRef = ref(storage, path);
    return await updateMetadata(storageRef, {
      customMetadata: metadata,
    });
  } catch (error) {
    console.error('Error updating file metadata:', error);
    throw error;
  }
};

/**
 * Upload template file
 */
export const uploadTemplate = async (
  templateId: string,
  file: File,
  metadata?: Record<string, string>
): Promise<string> => {
  const path = `${storagePaths.templates}/${templateId}/${file.name}`;
  await uploadFile(path, file, metadata);
  return await getFileURL(path);
};

/**
 * Upload document file
 */
export const uploadDocument = async (
  projectId: string,
  documentId: string,
  file: File,
  metadata?: Record<string, string>
): Promise<string> => {
  const path = `${storagePaths.documents}/${projectId}/${documentId}/${file.name}`;
  await uploadFile(path, file, metadata);
  return await getFileURL(path);
};

/**
 * Upload company logo
 */
export const uploadCompanyLogo = async (
  companyId: string,
  file: File
): Promise<string> => {
  const extension = file.name.split('.').pop();
  const path = `${storagePaths.companyLogos}/${companyId}.${extension}`;
  await uploadFile(path, file);
  return await getFileURL(path);
};

/**
 * Upload user avatar
 */
export const uploadUserAvatar = async (
  userId: string,
  file: File
): Promise<string> => {
  const extension = file.name.split('.').pop();
  const path = `${storagePaths.userAvatars}/${userId}.${extension}`;
  await uploadFile(path, file);
  return await getFileURL(path);
};

/**
 * Delete all files in a directory
 */
export const deleteDirectory = async (path: string): Promise<void> => {
  try {
    const files = await listFiles(path);
    await Promise.all(files.map((fileRef) => deleteObject(fileRef)));
  } catch (error) {
    console.error('Error deleting directory:', error);
    throw error;
  }
};

/**
 * Delete template and all its files
 */
export const deleteTemplateFiles = async (templateId: string): Promise<void> => {
  const path = `${storagePaths.templates}/${templateId}`;
  await deleteDirectory(path);
};

/**
 * Delete all documents for a project
 */
export const deleteProjectDocuments = async (projectId: string): Promise<void> => {
  const path = `${storagePaths.documents}/${projectId}`;
  await deleteDirectory(path);
};

/**
 * Storage reference helper
 */
export { ref };
export type { StorageReference, UploadTask, FullMetadata };
