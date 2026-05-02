import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  url: string;
}

// Google Docs default margin: 1 inch = 72 PDF points
// Letter page width: 612 PDF points
// Margin as fraction of page width: 72/612 ≈ 0.1176
// Between two pages we need to clip: bottom margin + top margin = 2 * 0.1176 ≈ 0.235
const MARGIN_FRACTION = 72 / 612; // 1 inch margin / letter width

export function PDFViewer({ url }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  function onDocumentLoadSuccess({ numPages: total }: { numPages: number }) {
    setNumPages(total);
  }

  // Calculate overlap in pixels based on rendered width
  // Each page has top + bottom margins, so between pages we overlap both
  const pageOverlap = Math.round(containerWidth * MARGIN_FRACTION * 2);

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
            className="overflow-hidden leading-none"
            style={{
              marginTop: index > 0 ? `-${pageOverlap}px` : undefined,
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
