import type { UploadPdfResponse } from "./types";
export declare function getByPath(obj: unknown, path: string): unknown;
/**
 * Extracts a value from the API JSON response using common field names.
 * Checks data, data.data, and nested objects. Adapt keys to match your API.
 */
export declare function bindValue(data: UploadPdfResponse | null | undefined, keys: string[]): string;
