import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  url: string;
}

// Google Docs default margin: 1 inch = 72 PDF points
// Letter page dimensions: 612 × 792 PDF points
// Rendered page height = containerWidth × (792 / 612)
// Margin in pixels = containerWidth × (72 / 612)
// Visible content height = containerWidth × ((792 - 144) / 612)  [remove top + bottom margins]
const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN_PT = 72;

export function PDFViewer({ url }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  function onDocumentLoadSuccess({ numPages: total }: { numPages: number }) {
    setNumPages(total);
  }

  const scale = containerWidth / PAGE_W;
  const marginPx = Math.round(MARGIN_PT * scale);
  const contentHeight = Math.round((PAGE_H - 2 * MARGIN_PT) * scale);

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
            style={{
              height: `${contentHeight}px`,
              overflow: 'hidden',
            }}
          >
            <div style={{ marginTop: `-${marginPx}px` }}>
              <Page
                pageNumber={index + 1}
                width={containerWidth || undefined}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </div>
          </div>
        ))}
      </Document>
    </div>
  );
}
