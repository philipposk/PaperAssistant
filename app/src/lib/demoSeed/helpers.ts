import { type FileRecord } from "../db";

export function textBlob(text: string, mime: string): Blob {
  return new Blob([text], { type: mime });
}

export function svgBlob(svg: string): Blob {
  return new Blob([svg], { type: "image/svg+xml" });
}

/** Minimal valid single-page PDF for demo uploads. */
export function minimalPdfBlob(title: string): Blob {
  const safe = title.replace(/[()\\]/g, "");
  const content = `BT /F1 18 Tf 72 720 Td (${safe}) Tj ET`;
  const len = content.length;
  const pdf = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length ${len}>>stream
${content}
endstream endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000270 00000 n 
0000000360 00000 n 
trailer<</Size 6/Root 1 0 R>>
startxref
430
%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

export function barChartSvg(
  title: string,
  labels: string[],
  values: number[],
  color = "#b9532b",
): string {
  const w = 480;
  const h = 280;
  const max = Math.max(...values, 1);
  const barW = Math.min(48, (w - 80) / labels.length - 8);
  const bars = labels
    .map((lab, i) => {
      const bh = (values[i] / max) * 160;
      const x = 60 + i * (barW + 12);
      const y = 200 - bh;
      return `<rect x="${x}" y="${y}" width="${barW}" height="${bh}" fill="${color}" rx="2"/>
<text x="${x + barW / 2}" y="220" text-anchor="middle" font-size="10" fill="#555">${lab}</text>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="Georgia,serif">
  <rect width="100%" height="100%" fill="#faf8f4"/>
  <text x="${w / 2}" y="28" text-anchor="middle" font-size="14" fill="#1a1a1a">${title}</text>
  <line x1="48" y1="200" x2="${w - 24}" y2="200" stroke="#ccc"/>
  ${bars}
</svg>`;
}

export function lineChartSvg(
  title: string,
  xs: number[],
  ys: number[],
  color = "#2a5f8f",
): string {
  const w = 480;
  const h = 280;
  const xmin = Math.min(...xs);
  const xmax = Math.max(...xs);
  const ymin = Math.min(...ys);
  const ymax = Math.max(...ys);
  const px = (x: number) => 60 + ((x - xmin) / (xmax - xmin || 1)) * (w - 100);
  const py = (y: number) => 200 - ((y - ymin) / (ymax - ymin || 1)) * 160;
  const pts = xs.map((x, i) => `${px(x)},${py(ys[i])}`).join(" ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="Georgia,serif">
  <rect width="100%" height="100%" fill="#faf8f4"/>
  <text x="${w / 2}" y="28" text-anchor="middle" font-size="14" fill="#1a1a1a">${title}</text>
  <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2"/>
</svg>`;
}

export function scatterSvg(title: string, n = 40, color = "#3d7a4a"): string {
  const w = 480;
  const h = 280;
  const dots = Array.from({ length: n }, (_, i) => {
    const x = 60 + ((i * 37) % 100) / 100 * (w - 100);
    const y = 60 + ((i * 53) % 100) / 100 * 140;
    return `<circle cx="${x}" cy="${y}" r="3" fill="${color}" opacity="0.7"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="Georgia,serif">
  <rect width="100%" height="100%" fill="#faf8f4"/>
  <text x="${w / 2}" y="28" text-anchor="middle" font-size="14" fill="#1a1a1a">${title}</text>
  ${dots}
</svg>`;
}

export function heatmapSvg(title: string, rows = 6, cols = 8): string {
  const w = 480;
  const h = 280;
  const cell = 18;
  let cells = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = ((r * 17 + c * 31) % 100) / 100;
      const g = Math.floor(40 + v * 180);
      cells += `<rect x="${80 + c * cell}" y="${50 + r * cell}" width="${cell - 2}" height="${cell - 2}" fill="rgb(${g},${100},${200 - g})"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="Georgia,serif">
  <rect width="100%" height="100%" fill="#faf8f4"/>
  <text x="${w / 2}" y="28" text-anchor="middle" font-size="14" fill="#1a1a1a">${title}</text>
  ${cells}
</svg>`;
}

export function csvBlob(headers: string[], rows: string[][]): Blob {
  const esc = (s: string) => (s.includes(",") ? `"${s.replace(/"/g, '""')}"` : s);
  const lines = [
    headers.map(esc).join(","),
    ...rows.map((r) => r.map(esc).join(",")),
  ];
  return textBlob(lines.join("\n"), "text/csv");
}

export function fileDisplayName(f: FileRecord): string {
  return f.caption?.trim() || f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
}
