import { useEffect, useState } from 'react';
import { useDemoState } from '../state/DemoStateProvider';

const scopeConfig = {
  flexible: {
    fixedRelevance: null,
    fixedPhase: null,
    helper: 'Save an internal-only note and decide whether it belongs on the insight or the client profile.',
  },
  general: {
    fixedRelevance: 'general',
    fixedPhase: null,
    helper: 'This note is stored against the client profile and remains internal only.',
  },
  insight: {
    fixedRelevance: 'insight',
    fixedPhase: null,
    helper: 'This note is attached to the selected insight and remains internal only.',
  },
  'engagement-pre': {
    fixedRelevance: 'general',
    fixedPhase: 'pre',
    helper: 'This note is stored as a pre-engagement note and remains internal only.',
  },
  'engagement-post': {
    fixedRelevance: 'general',
    fixedPhase: 'post',
    helper: 'This note is stored as a post-engagement note and remains internal only.',
  },
};

function getInitialState(scope, initialNote) {
  return {
    body: initialNote?.body ?? '',
    relevance: initialNote?.relevance ?? (scopeConfig[scope]?.fixedRelevance ?? 'insight'),
    durationType: initialNote?.durationType ?? 'permanent',
    expiresOn: initialNote?.expiresOn ?? '',
  };
}

export function InternalNoteComposer({
  open,
  onClose,
  onSubmit,
  scope = 'flexible',
  title = 'Internal note',
  description = 'Internal notes stay in the system and never flow into client-facing delivery.',
  submitLabel = 'Save note',
  initialNote = null,
}) {
  const [formState, setFormState] = useState(getInitialState(scope, initialNote));
  const scopeDefinition = scopeConfig[scope] ?? scopeConfig.flexible;
  const resolvedRelevance = scopeDefinition.fixedRelevance ?? formState.relevance;

  useEffect(() => {
    if (open) {
      setFormState(getInitialState(scope, initialNote));
    }
  }, [initialNote, open, scope]);

  if (!open) {
    return null;
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      body: formState.body.trim(),
      relevance: resolvedRelevance,
      durationType: formState.durationType,
      expiresOn: formState.durationType === 'time-constrained' ? formState.expiresOn : null,
      engagementPhase: scopeDefinition.fixedPhase,
    });
    onClose();
  }

  const disableSubmit = !formState.body.trim() || (formState.durationType === 'time-constrained' && !formState.expiresOn);

  return (
    <div className="overlay-backdrop">
      <div className="overlay-card note-composer" role="dialog" aria-modal="true" aria-label={title}>
        <div className="overlay-header">
          <div>
            <p className="eyebrow">Internal note</p>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
          <button type="button" className="button button--ghost" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="panel-stack" onSubmit={handleSubmit}>
          <article className="list-item">
            <h4>Note scope</h4>
            <p>{scopeDefinition.helper}</p>
          </article>

          <label className="topbar-field topbar-field--full">
            <span>Internal note</span>
            <textarea
              aria-label="Internal note text"
              className="note-textarea"
              value={formState.body}
              onChange={event => setFormState(current => ({ ...current, body: event.target.value }))}
            />
          </label>

          {scopeDefinition.fixedRelevance ? null : (
            <label className="topbar-field topbar-field--full">
              <span>Note relevance</span>
              <select
                aria-label="Note relevance"
                value={formState.relevance}
                onChange={event => setFormState(current => ({ ...current, relevance: event.target.value }))}
              >
                <option value="insight">Insight relevant</option>
                <option value="general">General client note</option>
              </select>
            </label>
          )}

          <div className="note-form-grid">
            <label className="topbar-field topbar-field--full">
              <span>Duration</span>
              <select
                aria-label="Note duration"
                value={formState.durationType}
                onChange={event =>
                  setFormState(current => ({
                    ...current,
                    durationType: event.target.value,
                    expiresOn: event.target.value === 'time-constrained' ? current.expiresOn : '',
                  }))
                }
              >
                <option value="permanent">Permanent</option>
                <option value="time-constrained">Time constrained</option>
              </select>
            </label>

            {formState.durationType === 'time-constrained' ? (
              <label className="topbar-field topbar-field--full">
                <span>Expiry date</span>
                <input
                  aria-label="Note expiry date"
                  type="date"
                  value={formState.expiresOn}
                  onChange={event => setFormState(current => ({ ...current, expiresOn: event.target.value }))}
                />
              </label>
            ) : null}
          </div>

          <div className="page-header-actions">
            <button type="submit" className="button button--primary" disabled={disableSubmit}>
              {submitLabel}
            </button>
            <button type="button" className="button button--ghost" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function JourneyNoteAction({
  clientId,
  insightRecordId,
  buttonLabel = 'Add internal note',
  buttonTone = 'secondary',
  buttonClassName = '',
}) {
  const [open, setOpen] = useState(false);
  const { dispatch } = useDemoState();

  return (
    <>
      <button type="button" className={`button button--${buttonTone} ${buttonClassName}`.trim()} onClick={() => setOpen(true)}>
        {buttonLabel}
      </button>
      <InternalNoteComposer
        open={open}
        onClose={() => setOpen(false)}
        title="Add internal note"
        description="This note stays internal and is stored against the live insight unless you tag it as a general client note."
        onSubmit={note =>
          dispatch({
            type: 'ADD_PORTAL_NOTE',
            note: {
              clientId,
              body: note.body,
              relevance: note.relevance,
              durationType: note.durationType,
              expiresOn: note.expiresOn,
              insightRecordId: note.relevance === 'insight' ? insightRecordId : null,
            },
          })
        }
      />
    </>
  );
}

export function EngagementPhaseNoteAction({
  clientId,
  scenarioId,
  engagementId = null,
  phase,
  buttonLabel = null,
  buttonTone = 'secondary',
}) {
  const [open, setOpen] = useState(false);
  const { dispatch } = useDemoState();
  const resolvedLabel = buttonLabel ?? (phase === 'pre' ? 'Add pre-engagement note' : 'Add post-engagement note');
  const disabled = phase === 'post' && !engagementId;

  function handleSubmit(note) {
    if (phase === 'pre' && !engagementId) {
      dispatch({
        type: 'ADD_PENDING_ENGAGEMENT_NOTE',
        scenarioId,
        note: {
          clientId,
          body: note.body,
          relevance: 'general',
          durationType: note.durationType,
          expiresOn: note.expiresOn,
        },
      });
      return;
    }

    dispatch({
      type: 'ADD_ENGAGEMENT_NOTE',
      engagementId,
      engagementPhase: phase,
      note: {
        clientId,
        body: note.body,
        relevance: 'general',
        durationType: note.durationType,
        expiresOn: note.expiresOn,
      },
    });
  }

  return (
    <>
      <button type="button" className={`button button--${buttonTone}`} onClick={() => setOpen(true)} disabled={disabled}>
        {resolvedLabel}
      </button>
      <InternalNoteComposer
        open={open}
        onClose={() => setOpen(false)}
        scope={phase === 'pre' ? 'engagement-pre' : 'engagement-post'}
        title={phase === 'pre' ? 'Add pre-engagement note' : 'Add post-engagement note'}
        description="These notes stay inside the system and are stored with the engagement record in the client portal."
        onSubmit={handleSubmit}
      />
    </>
  );
}
