import type { UploadPdfResponse, UploadPdfOptions } from "./types.js";

const DEFAULT_BASE_URL = "http://localhost:3000";
const DEFAULT_FIELD_NAME = "file";

/**
 * Uploads a PDF file to the OCR API and returns the JSON response as typed data.
 *
 * @param file - PDF file (File in browser or Blob/Buffer in Node)
 * @param options - Optional base URL and form field name
 * @returns Parsed JSON response bound to UploadPdfResponse
 */
export async function uploadPdf(
  file: File | Blob,
  options: UploadPdfOptions = {}
): Promise<UploadPdfResponse> {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const fieldName = options.fieldName ?? DEFAULT_FIELD_NAME;
  const url = `${baseUrl}/api/ocr/proposal`;

  const formData = new FormData();
  const fileName =
    file instanceof File ? file.name : options.filename ?? "document.pdf";
  formData.append(fieldName, file, fileName);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      `Upload failed: ${response.status} ${response.statusText}`
    );
  }

  const json = (await response.json()) as UploadPdfResponse;
  return json;
}
