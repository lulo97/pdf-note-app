import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import Popup from "./Popup";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export function PdfViewer() {
  const [numPages, setNumPages] = useState(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [popup, setPopup] = useState(null);

  const containerRef = useRef(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  // Fit width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Ctrl + wheel zoom
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();

        setZoom((prev) => {
          const next = e.deltaY < 0 ? prev + 0.1 : prev - 0.1;
          return Math.min(Math.max(next, 0.5), 3);
        });
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  // 🔥 Detect double click selection
  // ✅ Ctrl + Click selection only
  const handleMouseUp = (e) => {
    // Only trigger when Ctrl key is pressed
    if (!e.ctrlKey) return;

    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (!selectedText) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    const spanElement = range.startContainer.parentElement;

    if (!spanElement) return;

    // Get full line (closest text span)
    const fullLine = spanElement.innerText;

    setPopup({
      word: selectedText,
      line: fullLine,
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY + 8,
    });
  };

  return (
    <div style={{ position: "relative" }}>
      {popup && (
        <Popup
          word={popup.word}
          line={popup.line}
          x={popup.x}
          y={popup.y}
          onClose={() => setPopup(null)}
        />
      )}

      <div
        ref={containerRef}
        onMouseUp={handleMouseUp}
        style={{
          width: "100%",
          height: "100vh",
          overflow: "auto",
          background: "#f0f0f0",
        }}
      >
        <Document file="/sample.pdf" onLoadSuccess={onDocumentLoadSuccess}>
          {Array.from(new Array(numPages || 0), (_, index) => (
            <Page
              key={index}
              pageNumber={index + 1}
              width={containerWidth * zoom}
              renderTextLayer
              renderAnnotationLayer
              devicePixelRatio={window.devicePixelRatio}
            />
          ))}
        </Document>
      </div>
    </div>
  );
}
