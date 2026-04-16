import { Download, X } from 'lucide-react';
import { Fragment, Suspense, lazy, useEffect, useState } from 'react';
import { getCitationKindLabel, getCitations, getKbDocument } from '../data/evidenceData';

const PdfDocumentViewer = lazy(() => import('./PdfDocumentViewer'));

function collectCitationIds(blocks = []) {
  const orderedIds = [];

  function rememberCitationIds(citationIds = []) {
    citationIds.forEach(citationId => {
      if (!orderedIds.includes(citationId)) {
        orderedIds.push(citationId);
      }
    });
  }

  blocks.forEach(block => {
    if (block.type === 'paragraph') {
      block.segments.forEach(segment => rememberCitationIds(segment.citationIds));
      return;
    }

    if (block.type === 'bullets' || block.type === 'numbered') {
      block.items.forEach(item => item.segments.forEach(segment => rememberCitationIds(segment.citationIds)));
      return;
    }

    if (block.type === 'table') {
      block.rows.forEach(row => row.cells.forEach(cell => cell.segments.forEach(segment => rememberCitationIds(segment.citationIds))));
    }
  });

  return orderedIds;
}

function InlineSegments({ blockId, segments, citations, citationNumbers, activeCitationId, activeMarkerId, onMarkerEnter, onMarkerLeave, onMarkerClick }) {
  return segments.map((segment, segmentIndex) => {
    const segmentActive = activeCitationId && segment.citationIds?.includes(activeCitationId);

    return (
      <Fragment key={`${blockId}-segment-${segmentIndex}`}>
        <span className={`rich-response__segment ${segmentActive ? 'rich-response__segment--active' : ''}`}>{segment.text}</span>
        {(segment.citationIds ?? []).map(citationId => {
          const citation = citations[citationId];
          if (!citation) {
            return null;
          }

          const markerId = `${blockId}-${segmentIndex}-${citationId}`;
          const markerActive = activeMarkerId === markerId;
          const detailText = citation.kind === 'kb' ? citation.excerpt : citation.dataUsed;

          return (
            <button
              key={markerId}
              type="button"
              className={`rich-response__citation ${citation.kind === 'kb' ? 'rich-response__citation--interactive' : 'rich-response__citation--static'} ${markerActive ? 'rich-response__citation--active' : ''}`}
              aria-label={`Citation ${citationNumbers[citationId]}: ${citation.title}`}
              onMouseEnter={() => onMarkerEnter({ markerId, citationId })}
              onMouseLeave={onMarkerLeave}
              onFocus={() => onMarkerEnter({ markerId, citationId })}
              onBlur={onMarkerLeave}
              onClick={() => onMarkerClick(citation)}
            >
              <sup>{citationNumbers[citationId]}</sup>
              {markerActive ? (
                <span role="tooltip" className="rich-response__tooltip">
                  <strong>{citation.title}</strong>
                  <span className="rich-response__tooltip-kind">{getCitationKindLabel(citation)}</span>
                  <span>{detailText}</span>
                </span>
              ) : null}
            </button>
          );
        })}
      </Fragment>
    );
  });
}

function ResponseBlock(props) {
  const { block } = props;

  if (block.type === 'paragraph') {
    return (
      <p className="rich-response__paragraph">
        <InlineSegments blockId={block.id} segments={block.segments} {...props} />
      </p>
    );
  }

  if (block.type === 'bullets' || block.type === 'numbered') {
    const ListTag = block.type === 'bullets' ? 'ul' : 'ol';

    return (
      <ListTag className={`rich-response__list rich-response__list--${block.type}`}>
        {block.items.map(item => (
          <li key={item.id}>
            <InlineSegments blockId={item.id} segments={item.segments} {...props} />
          </li>
        ))}
      </ListTag>
    );
  }

  if (block.type === 'table') {
    return (
      <div className="rich-response__table-wrap">
        <table className="rich-response__table">
          <thead>
            <tr>
              {block.columns.map(column => (
                <th key={column.id} scope="col">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map(row => (
              <tr key={row.id}>
                {row.cells.map((cell, cellIndex) => (
                  <td key={`${row.id}-${block.columns[cellIndex]?.id ?? cellIndex}`}>
                    <InlineSegments blockId={`${row.id}-${cellIndex}`} segments={cell.segments} {...props} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
}

function SourceDocumentModal({ citation, onClose }) {
  const kbDocument = getKbDocument(citation?.documentId);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!citation || !kbDocument) {
    return null;
  }

  return (
    <div className="overlay-backdrop" onClick={event => event.target === event.currentTarget && onClose()}>
      <div className="overlay-card source-document-modal" role="dialog" aria-modal="true" aria-label="Source document viewer">
        <div className="overlay-header source-document-modal__header">
          <div className="source-document-modal__heading">
            <p className="eyebrow">Source document</p>
            <h3>{citation.title}</h3>
            <p>{kbDocument.title}</p>
            <p className="source-document-modal__excerpt">{citation.excerpt}</p>
          </div>
          <div className="source-document-modal__actions">
            <a className="button button--ghost" href={kbDocument.url} download={kbDocument.fileName}>
              <Download size={16} />
              Download document
            </a>
            <button type="button" className="button button--ghost" onClick={onClose} aria-label="Close source document viewer">
              <X size={16} />
              Close
            </button>
          </div>
        </div>

        <div className="source-document-modal__viewer">
          <Suspense fallback={<div className="source-document-modal__loading">Loading document viewer...</div>}>
            <PdfDocumentViewer
              documentTitle={kbDocument.title}
              documentUrl={kbDocument.url}
              excerpt={citation.excerpt}
              quote={citation.quote}
              targetPage={citation.page}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default function RichEvidenceNarrative({ title = null, response = null }) {
  const [activeMarker, setActiveMarker] = useState(null);
  const [openCitation, setOpenCitation] = useState(null);

  if (!response?.blocks?.length) {
    return null;
  }

  const citationIds = collectCitationIds(response.blocks);
  const citations = Object.fromEntries(getCitations(citationIds).map(citation => [citation.id, citation]));
  const citationNumbers = Object.fromEntries(citationIds.map((citationId, index) => [citationId, index + 1]));
  const activeCitationId = activeMarker?.citationId ?? null;
  const narrativeTitle = title ?? response.title ?? 'Detailed model interpretation';

  function handleMarkerClick(citation) {
    if (citation.kind === 'kb') {
      setOpenCitation(citation);
    }
  }

  return (
    <>
      <div className="rich-response">
        <span className="eyebrow">{narrativeTitle}</span>

        <div className="rich-response__body">
          {response.blocks.map(block => (
            <ResponseBlock
              key={block.id}
              activeCitationId={activeCitationId}
              activeMarkerId={activeMarker?.markerId ?? null}
              block={block}
              citationNumbers={citationNumbers}
              citations={citations}
              onMarkerClick={handleMarkerClick}
              onMarkerEnter={setActiveMarker}
              onMarkerLeave={() => setActiveMarker(null)}
            />
          ))}
        </div>
      </div>

      {openCitation ? <SourceDocumentModal citation={openCitation} onClose={() => setOpenCitation(null)} /> : null}
    </>
  );
}
