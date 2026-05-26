// Extract plain text from a PDF Blob using pdfjs-dist. Cached per file_id.
// pdfjs is already a transitive dep of react-pdf-highlighter-extended.

import * as pdfjs from "pdfjs-dist";
// Vite-friendly worker resolution: import the worker as a URL.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — pdfjs ships its worker as a separate entry.
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

let configured = false;
function configureWorker() {
  if (configured) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (pdfjs as any).GlobalWorkerOptions.workerSrc = pdfWorker;
  configured = true;
}

const cache = new Map<string, string>();

export async function extractPdfText(fileId: string, blob: Blob): Promise<string> {
  if (cache.has(fileId)) return cache.get(fileId)!;
  configureWorker();
  const buf = await blob.arrayBuffer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = await (pdfjs as any).getDocument({ data: buf }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const text = (content.items as any[])
      .map((it) => ("str" in it ? it.str : ""))
      .join(" ");
    pages.push(`--- Page ${i} ---\n${text}`);
  }
  const merged = pages.join("\n\n");
  cache.set(fileId, merged);
  return merged;
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + `\n\n[…truncated ${text.length - max} chars]`;
}
