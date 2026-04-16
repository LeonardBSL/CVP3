import { useEffect, useRef, useState } from 'react';

const VIEWER_SCALE = 1.15;

function normalizeText(text = '') {
  return text.replace(/\s+/g, ' ').trim();
}

function getHighlightIndices(textContent, quote) {
  const normalizedQuote = normalizeText(quote).toLowerCase();
  if (!normalizedQuote) {
    return [];
  }

  const indexedItems = [];
  let combinedText = '';

  textContent.items.forEach((item, itemIndex) => {
    if (!('str' in item)) {
      return;
    }

    const normalizedItem = normalizeText(item.str);
    if (!normalizedItem) {
      return;
    }

    const prefix = combinedText ? ' ' : '';
    const start = combinedText.length + prefix.length;
    combinedText += `${prefix}${normalizedItem}`;

    indexedItems.push({
      itemIndex,
      start,
      end: combinedText.length,
    });
  });

  const matchStart = combinedText.toLowerCase().indexOf(normalizedQuote);
  if (matchStart === -1) {
    return [];
  }

  const matchEnd = matchStart + normalizedQuote.length;
  return indexedItems
    .filter(item => item.end > matchStart && item.start < matchEnd)
    .map(item => item.itemIndex);
}

function multiplyTransforms(left, right) {
  return [
    left[0] * right[0] + left[2] * right[1],
    left[1] * right[0] + left[3] * right[1],
    left[0] * right[2] + left[2] * right[3],
    left[1] * right[2] + left[3] * right[3],
    left[0] * right[4] + left[2] * right[5] + left[4],
    left[1] * right[4] + left[3] * right[5] + left[5],
  ];
}

function renderTextLayer(container, viewport, textContent, highlightIndices) {
  if (!container) {
    return;
  }

  container.innerHTML = '';
  const highlightSet = new Set(highlightIndices);

  textContent.items.forEach((item, itemIndex) => {
    if (!('str' in item) || !normalizeText(item.str)) {
      return;
    }

    const transform = multiplyTransforms(viewport.transform, item.transform);
    const fontSize = Math.hypot(transform[0], transform[1]);
    const span = document.createElement('span');
    span.className = `pdf-page__text-item ${highlightSet.has(itemIndex) ? 'pdf-page__text-item--highlighted' : ''}`.trim();
    span.textContent = item.str;
    span.style.left = `${transform[4]}px`;
    span.style.top = `${transform[5] - fontSize}px`;
    span.style.fontSize = `${fontSize}px`;
    span.style.transformOrigin = 'left top';
    span.style.transform = `scaleX(${fontSize ? transform[0] / fontSize : 1})`;
    container.appendChild(span);
  });
}

function PdfPageSection({ pageData, onPageMount }) {
  const canvasRef = useRef(null);
  const textLayerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function renderPage() {
      const canvas = canvasRef.current;
      const context = canvas?.getContext?.('2d');

      if (!canvas || !context) {
        return;
      }

      canvas.width = pageData.viewport.width;
      canvas.height = pageData.viewport.height;
      canvas.style.width = `${pageData.viewport.width}px`;
      canvas.style.height = `${pageData.viewport.height}px`;

      const renderTask = pageData.page.render({
        canvasContext: context,
        viewport: pageData.viewport,
      });

      await renderTask.promise;

      if (!cancelled) {
        renderTextLayer(textLayerRef.current, pageData.viewport, pageData.textContent, pageData.highlightIndices);
      }
    }

    renderPage();

    return () => {
      cancelled = true;
    };
  }, [pageData]);

  return (
    <section ref={node => onPageMount(pageData.pageNumber, node)} className="pdf-page">
      <div className="pdf-page__meta">Page {pageData.pageNumber}</div>
      <div className="pdf-page__canvas-shell" style={{ width: pageData.viewport.width, height: pageData.viewport.height }}>
        <canvas ref={canvasRef} />
        <div ref={textLayerRef} className="pdf-page__text-layer" />
      </div>
    </section>
  );
}

export default function PdfDocumentViewer({ documentTitle, documentUrl, excerpt, quote, targetPage }) {
  const [viewerState, setViewerState] = useState({
    status: 'loading',
    pages: [],
    quoteMatched: false,
    error: null,
  });
  const pageRefs = useRef(new Map());
  const isJsdomEnvironment = typeof window !== 'undefined' && /jsdom/i.test(window.navigator.userAgent);

  useEffect(() => {
    if (isJsdomEnvironment) {
      setViewerState({
        status: 'ready',
        pages: [],
        quoteMatched: false,
        error: null,
      });
      return undefined;
    }

    let cancelled = false;
    let loadingTask = null;

    async function loadDocument() {
      try {
        const pdfModule = await import('pdfjs-dist/build/pdf.mjs');
        const workerModule = await import('pdfjs-dist/build/pdf.worker.mjs?url');
        pdfModule.GlobalWorkerOptions.workerSrc = workerModule.default;
        loadingTask = pdfModule.getDocument(documentUrl);
        const pdf = await loadingTask.promise;
        const pages = [];

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: VIEWER_SCALE });
          const textContent = await page.getTextContent();
          const highlightIndices = pageNumber === targetPage ? getHighlightIndices(textContent, quote) : [];

          pages.push({
            page,
            pageNumber,
            viewport,
            textContent,
            highlightIndices,
          });
        }

        if (!cancelled) {
          setViewerState({
            status: 'ready',
            pages,
            quoteMatched: pages.some(page => page.highlightIndices.length > 0),
            error: null,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setViewerState({
            status: 'error',
            pages: [],
            quoteMatched: false,
            error,
          });
        }
      }
    }

    loadDocument();

    return () => {
      cancelled = true;
      loadingTask?.destroy();
    };
  }, [documentUrl, isJsdomEnvironment, quote, targetPage]);

  useEffect(() => {
    if (viewerState.status !== 'ready' || isJsdomEnvironment) {
      return;
    }

    const targetNode = pageRefs.current.get(targetPage);
    targetNode?.scrollIntoView?.({ block: 'start' });
  }, [isJsdomEnvironment, targetPage, viewerState.status]);

  if (viewerState.status === 'loading') {
    return <div className="pdf-viewer__status">Loading {documentTitle}...</div>;
  }

  if (viewerState.status === 'error') {
    return (
      <div className="pdf-viewer__status">
        <strong>Unable to render the PDF preview.</strong>
        <span>{viewerState.error?.message ?? excerpt}</span>
      </div>
    );
  }

  if (isJsdomEnvironment) {
    return (
      <div className="pdf-viewer__status">
        <strong>PDF viewer unavailable in the test environment.</strong>
        <span>{excerpt}</span>
      </div>
    );
  }

  return (
    <div className="pdf-viewer">
      {!viewerState.quoteMatched ? (
        <div className="pdf-viewer__note">
          Showing page {targetPage}. Exact quote highlighting was unavailable, so the stored excerpt remains visible above.
        </div>
      ) : null}

      <div className="pdf-viewer__pages">
        {viewerState.pages.map(pageData => (
          <PdfPageSection
            key={pageData.pageNumber}
            onPageMount={(pageNumber, node) => {
              if (node) {
                pageRefs.current.set(pageNumber, node);
                return;
              }

              pageRefs.current.delete(pageNumber);
            }}
            pageData={pageData}
          />
        ))}
      </div>
    </div>
  );
}
