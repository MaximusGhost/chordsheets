import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  url: string;
}

// Google Docs default margin: 1 inch = 72 PDF points
// Letter page dimensions: 612 × 792 PDF points
// Margin as fraction of page HEIGHT for clip-path: 72/792 ≈ 9.09%
// Margin in pixels = containerWidth × 72/612 (used to collapse layout space)
const MARGIN_WIDTH_FRACTION = 72 / 612;
const CLIP_PCT = ((72 / 792) * 100).toFixed(2); // ≈ "9.09"

export function PDFViewer({ url }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  function onDocumentLoadSuccess({ numPages: total }: { numPages: number }) {
    setNumPages(total);
  }

  // Margin in rendered pixels — used for negative margin to collapse clipped space
  const marginPx = Math.round(containerWidth * MARGIN_WIDTH_FRACTION);

  return (
    <div
      className="w-full overflow-auto bg-slate-950"
      ref={(el) => {
        if (el) setContainerWidth(el.clientWidth);
      }}
    >
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }
        error={
          <div className="text-center py-20 text-red-400">
            Failed to load PDF
          </div>
        }
      >
        {Array.from(new Array(numPages), (_, index) => (
          <div
            key={`page_${index + 1}`}
            className="leading-none"
            style={{
              clipPath: `inset(${CLIP_PCT}% 0)`,
              marginTop: `-${marginPx}px`,
              marginBottom: `-${marginPx}px`,
            }}
          >
            <Page
              pageNumber={index + 1}
              width={containerWidth || undefined}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </div>
        ))}
      </Document>
    </div>
  );
}
