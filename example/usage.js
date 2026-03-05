/**
 * Example: Upload a PDF and bind the JSON response
 * Run: node example/usage.js <path-to-your.pdf>
 */

import { uploadPdf } from "../dist/uploadPdf.js";
import { readFileSync } from "fs";
import { basename } from "path";

async function main() {
  const pdfPath = process.argv[2];
  if (!pdfPath) {
    console.error("Usage: node example/usage.js <path-to-your.pdf>");
    process.exit(1);
  }

  const buffer = readFileSync(pdfPath);
  const blob = new Blob([buffer], { type: "application/pdf" });

  try {
    const data = await uploadPdf(blob, { filename: basename(pdfPath) });
    console.log("Response (bound data):", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Upload error:", err.message);
    process.exit(1);
  }
}

main();
