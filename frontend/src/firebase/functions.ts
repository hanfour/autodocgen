// Firebase Cloud Functions Helper
import { httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { functions } from './config';

/**
 * Type definitions for Cloud Functions requests and responses
 */

// Document Generation
export interface GenerateDocumentsRequest {
  projectId: string;
  templateIds: string[];
}

export interface GenerateDocumentsResponse {
  success: boolean;
  documentIds: string[];
  failedTemplates?: {
    templateId: string;
    error: string;
  }[];
}

// Template Variable Inference
export interface InferTemplateVariablesRequest {
  templateUrl: string;
}

export interface InferTemplateVariablesResponse {
  success: boolean;
  variables: {
    standard: string[];
    custom: string[];
  };
}

// Document Regeneration
export interface RegenerateDocumentRequest {
  documentId: string;
}

export interface RegenerateDocumentResponse {
  success: boolean;
  documentId: string;
  downloadUrl: string;
}

// Data Migration
export interface MigrateDataRequest {
  type: 'companies' | 'contacts' | 'projects';
  data: any[];
}

export interface MigrateDataResponse {
  success: boolean;
  imported: number;
  failed: number;
  errors?: string[];
}

// Document Number Generation
export interface GenerateDocumentNumberRequest {
  templateType: string;
  year?: number;
}

export interface GenerateDocumentNumberResponse {
  success: boolean;
  documentNumber: string;
}

/**
 * Call a Cloud Function
 */
const callFunction = async <TRequest, TResponse>(
  functionName: string,
  data?: TRequest
): Promise<TResponse> => {
  try {
    const callable = httpsCallable<TRequest, TResponse>(functions, functionName);
    const result: HttpsCallableResult<TResponse> = await callable(data);
    return result.data;
  } catch (error: any) {
    console.error(`Error calling function ${functionName}:`, error);
    throw new Error(error.message || `Failed to call ${functionName}`);
  }
};

/**
 * Generate documents from templates
 */
export const generateDocuments = async (
  request: GenerateDocumentsRequest
): Promise<GenerateDocumentsResponse> => {
  return callFunction<GenerateDocumentsRequest, GenerateDocumentsResponse>(
    'generateDocuments',
    request
  );
};

/**
 * Infer template variables from uploaded template
 */
export const inferTemplateVariables = async (
  request: InferTemplateVariablesRequest
): Promise<InferTemplateVariablesResponse> => {
  return callFunction<InferTemplateVariablesRequest, InferTemplateVariablesResponse>(
    'inferTemplateVariables',
    request
  );
};

/**
 * Regenerate a single document
 */
export const regenerateDocument = async (
  request: RegenerateDocumentRequest
): Promise<RegenerateDocumentResponse> => {
  return callFunction<RegenerateDocumentRequest, RegenerateDocumentResponse>(
    'regenerateDocument',
    request
  );
};

/**
 * Migrate data from legacy system
 */
export const migrateData = async (
  request: MigrateDataRequest
): Promise<MigrateDataResponse> => {
  return callFunction<MigrateDataRequest, MigrateDataResponse>(
    'migrateData',
    request
  );
};

/**
 * Generate document number (HIYES format)
 */
export const generateDocumentNumber = async (
  request: GenerateDocumentNumberRequest
): Promise<GenerateDocumentNumberResponse> => {
  return callFunction<GenerateDocumentNumberRequest, GenerateDocumentNumberResponse>(
    'generateDocumentNumber',
    request
  );
};

/**
 * Export all Cloud Functions helpers
 */
export const cloudFunctions = {
  generateDocuments,
  inferTemplateVariables,
  regenerateDocument,
  migrateData,
  generateDocumentNumber,
};

export default cloudFunctions;
