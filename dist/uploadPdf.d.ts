import type { UploadPdfResponse, UploadPdfOptions } from "./types.js";
/**
 * Uploads a PDF file to the webhook API and returns the JSON response as typed data.
 *
 * @param file - PDF file (File in browser or Blob/Buffer in Node)
 * @param options - Optional base URL and form field name
 * @returns Parsed JSON response bound to UploadPdfResponse
 */
export declare function uploadPdf(file: File | Blob, options?: UploadPdfOptions): Promise<UploadPdfResponse>;
