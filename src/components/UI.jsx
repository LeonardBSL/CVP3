import { Check, CheckCircle2, ChevronRight, Download, Mail, Phone, Presentation, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSources } from '../data/demoData';
import { getCitationKindLabel } from '../data/evidenceData';
import { useDemoState } from '../state/DemoStateProvider';

export function useJourneyStep(journey, step) {
  const { dispatch } = useDemoState();

  useEffect(() => {
    dispatch({
      type: 'SET_JOURNEY_STEP',
      journey,
      step,
    });
  }, [dispatch, journey, step]);
}

export function PageHeader({ eyebrow, title, description, actions = null }) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p className="page-description">{description}</p>
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </header>
  );
}

export function StatusPill({ tone = 'neutral', children }) {
  return <span className={`status-pill status-pill--${tone}`}>{children}</span>;
}

export function SectionPanel({ title, subtitle, action = null, children, accent = 'default', className = '' }) {
  return (
    <section className={`panel panel--${accent} ${className}`.trim()}>
      <div className="panel-header">
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function SourceChips({ sourceIds }) {
  const sources = getSources(sourceIds);
  return (
    <div className="source-chip-row">
      {sources.map(source => (
        <span key={source.id} className={`source-chip source-chip--${source.kind ?? 'neutral'}`}>
          <strong>{getCitationKindLabel(source)}</strong>
          {source.title}
        </span>
      ))}
    </div>
  );
}

export function SourceAnchoredNarrative({ title = 'Detailed model interpretation', intro = null, paragraphs = [] }) {
  const [activeSource, setActiveSource] = useState(null);

  if (!intro && !paragraphs.length) {
    return null;
  }

  return (
    <div className="llm-response">
      <div>
        <span className="eyebrow">{title}</span>
        {intro ? <p className="llm-response__intro">{intro}</p> : null}
      </div>

      <div className="llm-response__stack">
        {paragraphs.map((paragraph, paragraphIndex) => {
          const sources = getSources(paragraph.sourceIds ?? []);
          const paragraphActive = activeSource?.paragraphId === paragraph.id;

          return (
            <article key={paragraph.id} className={`llm-response__paragraph ${paragraphActive ? 'llm-response__paragraph--active' : ''}`}>
              <p>{paragraph.text}</p>
              {sources.length ? (
                <div className="source-box-row">
                  {sources.map((source, sourceIndex) => {
                    const active = paragraphActive && activeSource?.sourceId === source.id;
                    return (
                      <button
                        key={source.id}
                        type="button"
                        className={`source-box ${active ? 'source-box--active' : ''}`}
                        onMouseEnter={() => setActiveSource({ paragraphId: paragraph.id, sourceId: source.id })}
                        onMouseLeave={() => setActiveSource(null)}
                        onFocus={() => setActiveSource({ paragraphId: paragraph.id, sourceId: source.id })}
                        onBlur={() => setActiveSource(null)}
                      >
                        <span>{`Source ${paragraphIndex + 1}.${sourceIndex + 1}`}</span>
                        {active ? (
                          <span role="tooltip" className="source-box__tooltip">
                            {source.reference}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function InsightCard({
  label = 'AI-generated insight',
  confidence,
  whyNow,
  sourceIds,
  narrative,
  recommendedAction,
  detailIntro = null,
  detailParagraphs = [],
  detailTitle = 'Detailed model interpretation',
  showSources = true,
  children = null,
}) {
  return (
    <div className="insight-card">
      <div className="insight-card__header">
        <div>
          <span className="eyebrow eyebrow--accent">{label}</span>
          <div className="confidence-row">
            <StatusPill tone="positive">{confidence}% confidence</StatusPill>
            <StatusPill tone="neutral">Why now surfaced</StatusPill>
          </div>
        </div>
        <div className="why-now-pill">{whyNow}</div>
      </div>

      <div className="narrative-grid">
        <article>
          <h4>What happened</h4>
          <p>{narrative.whatHappened}</p>
        </article>
        <article>
          <h4>Why it matters</h4>
          <p>{narrative.whyItMatters}</p>
        </article>
        <article>
          <h4>What to do next</h4>
          <p>{narrative.whatToDoNext}</p>
        </article>
      </div>

      {recommendedAction ? (
        <div className="recommended-action">
          <span className="eyebrow">Recommended action</span>
          <p>{recommendedAction}</p>
        </div>
      ) : null}

      <SourceAnchoredNarrative title={detailTitle} intro={detailIntro} paragraphs={detailParagraphs} />

      {showSources ? <SourceChips sourceIds={sourceIds} /> : null}
      {children}
    </div>
  );
}

export function MetricGrid({ items }) {
  return (
    <div className="metric-grid">
      {items.map(item => (
        <article key={item.label} className="metric-card">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          {item.meta ? <p>{item.meta}</p> : null}
        </article>
      ))}
    </div>
  );
}

export function JourneyStepper({ steps, currentStep }) {
  return (
    <div className="journey-stepper">
      {steps.map(step => (
        <div key={step.id} className={`journey-step ${currentStep === step.id ? 'journey-step--active' : ''}`}>
          <span>{step.label}</span>
        </div>
      ))}
    </div>
  );
}

export function InsightJourneyStepper({ steps, currentStep, ariaLabel = 'Insight delivery progress' }) {
  return (
    <ol className="insight-stepper" aria-label={ariaLabel}>
      {steps.map((step, index) => {
        const active = step.id === currentStep;

        return (
          <li key={step.id} className={`insight-step ${active ? 'insight-step--active' : ''}`}>
            <div className="insight-step__marker">
              <span className="insight-step__circle" aria-hidden="true">
                {index + 1}
              </span>
              <span className="insight-step__label">{step.label}</span>
            </div>
            {index < steps.length - 1 ? <span className="insight-step__line" aria-hidden="true" /> : null}
          </li>
        );
      })}
    </ol>
  );
}

export function LookupJourneyTabs({ currentStep }) {
  const steps = [
    { id: 'search', label: 'Search', to: '/lookup/search' },
    { id: 'response', label: 'Response', to: '/lookup/response' },
    { id: 'recommendation', label: 'Recommendation', to: '/lookup/recommendation' },
  ];

  return (
    <nav className="lookup-journey-tabs" aria-label="Advisory lookup progress">
      {steps.map(step => (
        <Link
          key={step.id}
          className={`lookup-journey-tab ${currentStep === step.id ? 'lookup-journey-tab--active' : ''}`}
          to={step.to}
          aria-current={currentStep === step.id ? 'step' : undefined}
        >
          <span>{step.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function SectorJourneyTabs({ currentStep }) {
  const steps = [
    { id: 'overview', label: 'Overview', to: '/sector/overview' },
    { id: 'deep-dive', label: 'Deep Dive', to: '/sector/deep-dive' },
    { id: 'client-relevance', label: 'Client Relevance', to: '/sector/client-relevance' },
  ];

  return (
    <nav className="lookup-journey-tabs sector-journey-tabs" aria-label="Sector briefing progress">
      {steps.map(step => (
        <Link
          key={step.id}
          className={`lookup-journey-tab sector-journey-tab ${currentStep === step.id ? 'lookup-journey-tab--active sector-journey-tab--active' : ''}`}
          to={step.to}
          aria-current={currentStep === step.id ? 'step' : undefined}
        >
          <span>{step.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function EngagementJourneyStepper({ steps, currentStep, ariaLabel = 'Advisory engagement progress' }) {
  const currentIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <ol className="engagement-stepper" aria-label={ariaLabel}>
      {steps.map((step, index) => {
        const state = index < currentIndex ? 'complete' : index === currentIndex ? 'active' : 'upcoming';
        const lineState = index < currentIndex ? 'complete' : 'upcoming';

        return (
          <li key={step.id} className={`engagement-step engagement-step--${state}`}>
            <div className="engagement-step__marker">
              <span className="engagement-step__circle" aria-hidden="true">
                {state === 'complete' ? <Check size={22} /> : index + 1}
              </span>
              <span className="engagement-step__label">{step.label}</span>
            </div>
            {index < steps.length - 1 ? <span className={`engagement-step__line engagement-step__line--${lineState}`} aria-hidden="true" /> : null}
          </li>
        );
      })}
    </ol>
  );
}

export function FeedbackStrip({ contextKey, actions = null, className = '' }) {
  const { state, dispatch } = useDemoState();
  return (
    <div className={`feedback-strip ${className}`.trim()}>
      <span>Signal useful?</span>
      <button type="button" className={state.feedback[contextKey] === 'up' ? 'feedback-button feedback-button--active' : 'feedback-button'} onClick={() => dispatch({ type: 'CAPTURE_FEEDBACK', contextKey, value: 'up' })}>
        <ThumbsUp size={14} />
        Helpful
      </button>
      <button type="button" className={state.feedback[contextKey] === 'down' ? 'feedback-button feedback-button--active' : 'feedback-button'} onClick={() => dispatch({ type: 'CAPTURE_FEEDBACK', contextKey, value: 'down' })}>
        <ThumbsDown size={14} />
        Not useful
      </button>
      {actions ? <div className="feedback-strip__actions">{actions}</div> : null}
    </div>
  );
}

export function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast--${toast.tone}`}>
          <div>
            <strong>{toast.title}</strong>
          </div>
          <button type="button" onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function ActionLink({ to, children, tone = 'primary' }) {
  return (
    <Link className={`button button--${tone}`} to={to}>
      {children}
      <ChevronRight size={16} />
    </Link>
  );
}

export function DeliveryActions({ onAction }) {
  return (
    <div className="button-row">
      <button type="button" className="button button--primary" onClick={() => onAction('send')}>
        <Mail size={16} />
        Send
      </button>
      <button type="button" className="button button--secondary" onClick={() => onAction('present')}>
        <Presentation size={16} />
        Present
      </button>
      <button type="button" className="button button--ghost" onClick={() => onAction('download')}>
        <Download size={16} />
        Download
      </button>
    </div>
  );
}

export function OutreachChoiceIcon({ choice }) {
  if (choice === 'call') return <Phone size={16} />;
  if (choice === 'email') return <Mail size={16} />;
  return <CheckCircle2 size={16} />;
}

export function PresentationOverlay({ open, onClose, title, clientName, sections = [], body = [] }) {
  if (!open) return null;

  return (
    <div className="overlay-backdrop">
      <div className="overlay-card">
        <div className="overlay-header">
          <div>
            <p className="eyebrow">Presentation mode</p>
            <h3>{title}</h3>
            <p>{clientName}</p>
          </div>
          <button type="button" className="button button--ghost" onClick={onClose}>
            Close
          </button>
        </div>

        {body.length ? (
          <div className="overlay-body">
            {body.map((paragraph, index) => (
              <article key={`${title}-${index}`} className="overlay-section">
                <p>{paragraph}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="overlay-grid">
            {sections.map(section => (
              <article key={section.title} className="overlay-section">
                <h4>{section.title}</h4>
                <p>{section.body}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
