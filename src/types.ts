/**
 * Response type from POST /api/ocr/proposal
 * Extend or adjust based on the actual API response schema.
 */
export interface UploadPdfResponse {
  /** Example fields - customize to match your API response */
  success?: boolean;
  message?: string;
  data?: Record<string, unknown>;
  /** Catch-all for additional fields from API */
  [key: string]: unknown;
}

export interface UploadPdfOptions {
  /** API base URL (default: http://localhost:3000) */
  baseUrl?: string;
  /** Form field name for the PDF file (default: "file") */
  fieldName?: string;
  /** Filename when using Blob (optional) */
  filename?: string;
}
