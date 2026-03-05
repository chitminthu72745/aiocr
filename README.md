# API Binding – PDF Upload

Type-safe binding for the `POST /webhook-test/upload_pdf` endpoint.

## Setup

```bash
npm install
npm run build
```

## React Web UI

```bash
npm run dev
```

Opens http://localhost:5173 – drag & drop or select a PDF, click Upload, and view the JSON response. Vite proxies `/webhook-test` to `http://localhost:5678`.

## Usage

### Node.js

```js
import { uploadPdf } from "./dist/index.js";

const blob = new Blob([pdfBuffer], { type: "application/pdf" });
const data = await uploadPdf(blob, { filename: "document.pdf" });
console.log(data); // Typed JSON response
```

### Browser

```html
<input type="file" accept=".pdf" id="fileInput" />
<script type="module">
  import { uploadPdf } from "./dist/index.js";

  document.getElementById("fileInput").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = await uploadPdf(file);
    console.log(data);
  });
</script>
```

### CLI Example

```bash
node example/usage.js path/to/your.pdf
```

## Customizing the response type

Update `src/types.ts` to match your API’s JSON response:

```ts
export interface UploadPdfResponse {
  success: boolean;
  message: string;
  result: { pages: number; text: string };
  // ... your API fields
}
```

## Options

| Option     | Default             | Description                          |
|-----------|---------------------|--------------------------------------|
| `baseUrl` | `http://localhost:5678` | API base URL                    |
| `fieldName` | `file`            | Form field name for the PDF          |
| `filename` | `document.pdf`     | Filename when using `Blob` (not `File`) |
