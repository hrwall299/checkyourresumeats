// Browser-only resume text extraction. Files never leave the user's device in the free check.
export const MAX_FILE_BYTES = 8 * 1024 * 1024;

export type ParsedResume = { text: string; pages: number; fileName: string; kind: "pdf" | "docx" | "text" };

export async function parseResumeFile(file: File): Promise<ParsedResume> {
  if (file.size > MAX_FILE_BYTES) throw new Error("File is larger than 8 MB. Please upload a smaller file.");
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const pdfjs = await import("pdfjs-dist");
    const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    const lines: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      let lastY: number | null = null;
      let line = "";
      for (const item of content.items as Array<{ str: string; transform: number[]; hasEOL?: boolean }>) {
        const y = item.transform?.[5];
        if (lastY !== null && y !== undefined && Math.abs(y - lastY) > 2) {
          lines.push(line.trim());
          line = "";
        }
        line += item.str + " ";
        if (y !== undefined) lastY = y;
      }
      if (line.trim()) lines.push(line.trim());
    }
    const text = lines.join("\n");
    if (text.replace(/\s/g, "").length < 50)
      throw new Error("We couldn't read text from this PDF. It may be a scanned image — ATS systems often can't read those either.");
    return { text, pages: doc.numPages, fileName: file.name, kind: "pdf" };
  }
  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    if (value.trim().length < 50) throw new Error("This document looks empty. Please check the file.");
    return { text: value, pages: Math.max(1, Math.round(value.split(/\s+/).length / 450)), fileName: file.name, kind: "docx" };
  }
  throw new Error("Unsupported file type. Please upload a PDF or DOCX resume.");
}
