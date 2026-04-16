import { SourceChips } from './UI';

function formatMeta(meta) {
  if (!meta) return null;
  return Array.isArray(meta) ? meta.join(' | ') : meta;
}

function SectionBody({ section }) {
  if (section.type === 'paragraph') {
    return <p>{section.body}</p>;
  }

  if (section.type === 'bullets') {
    return (
      <ul className="lookup-agent-list">
        {section.items.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  if (section.type === 'key-value') {
    return (
      <div className="lookup-agent-grid">
        {section.items.map(item => (
          <article key={item.label} className="list-item lookup-agent-item">
            <h5>{item.label}</h5>
            <p>{item.value}</p>
          </article>
        ))}
      </div>
    );
  }

  if (section.type === 'cards') {
    return (
      <div className="lookup-agent-grid">
        {section.items.map(item => (
          <article key={item.title} className="list-item lookup-agent-item">
            <h5>{item.title}</h5>
            <p>{item.body}</p>
            {item.meta ? <div className="inline-meta">{formatMeta(item.meta)}</div> : null}
          </article>
        ))}
      </div>
    );
  }

  return null;
}

export default function LookupAgentOutput({ presentation, sections = null, showSources = true }) {
  if (!presentation) {
    return null;
  }

  const visibleSections = sections ?? presentation.sections;

  return (
    <div className="lookup-agent-output">
      {presentation.summary ? <p className="lookup-agent-output__summary">{presentation.summary}</p> : null}

      <div className="lookup-agent-output__sections">
        {visibleSections.map(section => (
          <section key={section.id} className="lookup-agent-section">
            <h4>{section.title}</h4>
            <SectionBody section={section} />
          </section>
        ))}
      </div>

      {showSources ? <SourceChips sourceIds={presentation.sourceIds} /> : null}
    </div>
  );
}
