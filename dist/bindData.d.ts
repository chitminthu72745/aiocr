import type { UploadPdfResponse } from "./types";
/**
 * Extracts a value from the API JSON response using common field names.
 * Checks data, data.data, and nested objects. Adapt keys to match your API.
 */
export declare function bindValue(data: UploadPdfResponse | null | undefined, keys: string[]): string;
