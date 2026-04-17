import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Search,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clients } from '../../data/demoData';
import { isPortalNoteExpired } from '../../data/clientPortalData';
import { InternalNoteComposer } from '../../components/InternalNotes';
import { StatusPill } from '../../components/UI';
import { useDemoState } from '../../state/DemoStateProvider';
import { getPortalRecordVisibility } from '../pageContext';

function sortByNewest(items, key) {
  return [...items].sort((left, right) => new Date(right[key]) - new Date(left[key]));
}

function formatTimestamp(value) {
  return new Date(value).toLocaleString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function channelLabel(channel) {
  return {
    call: 'Call',
    email: 'Email',
    meeting: 'Meeting',
  }[channel] ?? channel;
}

function channelIcon(channel) {
  if (channel === 'email') {
    return Mail;
  }

  if (channel === 'call') {
    return Phone;
  }

  return CalendarDays;
}

function noteTone(note) {
  if (isPortalNoteExpired(note)) return 'critical';
  if (note.durationType === 'time-constrained') return 'warning';
  return 'positive';
}

function noteDurationLabel(note) {
  if (note.durationType === 'time-constrained') {
    return isPortalNoteExpired(note) ? `Expired ${formatDate(note.expiresOn)}` : `Expires ${formatDate(note.expiresOn)}`;
  }

  return 'Permanent';
}

function noteMatchesVisibility(note, { searchValue, durationFilter, showExpired }) {
  if (!showExpired && isPortalNoteExpired(note)) {
    return false;
  }

  if (durationFilter !== 'all' && note.durationType !== durationFilter) {
    return false;
  }

  if (!searchValue) {
    return true;
  }

  return note.body.toLowerCase().includes(searchValue);
}

function PortalNoteList({ emptyMessage, notes, onEdit }) {
  if (!notes.length) {
    return <p className="portal-empty-message">{emptyMessage}</p>;
  }

  return (
    <div className="portal-note-list">
      {notes.map(note => (
        <article key={note.id} className={`portal-note-card portal-note-card--${noteTone(note)}`}>
          <div className="portal-note-card__header">
            <div className="portal-note-card__meta">
              <span>{noteDurationLabel(note)}</span>
              <span>Updated {formatTimestamp(note.updatedAt)}</span>
            </div>
            <button
              type="button"
              className="portal-inline-action"
              aria-label={`Edit note ${note.body.slice(0, 32)}`}
              onClick={() => onEdit(note)}
            >
              Edit
            </button>
          </div>
          <p>{note.body}</p>
        </article>
      ))}
    </div>
  );
}

export default function ClientPortalPage() {
  const { state, dispatch } = useDemoState();
  const [searchValue, setSearchValue] = useState('');
  const [sharedFilter, setSharedFilter] = useState('all');
  const [noteTypeFilter, setNoteTypeFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [showExpired, setShowExpired] = useState(false);
  const [expandedInsights, setExpandedInsights] = useState({});
  const [expandedEngagements, setExpandedEngagements] = useState({});
  const [showAllInsights, setShowAllInsights] = useState(false);
  const [composerState, setComposerState] = useState(null);

  const client = clients.find(item => item.id === state.selectedClientId) ?? clients[0];
  const notesById = state.clientPortal.notes;
  const normalizedSearch = searchValue.trim().toLowerCase();

  const clientGeneralNotes = sortByNewest(
    state.clientPortal.generalNotes
      .map(noteId => notesById[noteId])
      .filter(note => note?.clientId === client.id),
    'updatedAt',
  );
  const clientInsights = sortByNewest(
    state.clientPortal.insightRecords.filter(record => record.clientId === client.id),
    'generatedAt',
  );
  const clientEngagements = sortByNewest(
    state.clientPortal.engagements.filter(engagement => engagement.clientId === client.id),
    'confirmedAt',
  );

  useEffect(() => {
    setShowAllInsights(false);
  }, [client.id, durationFilter, normalizedSearch, sharedFilter, showExpired]);

  const visibleGeneralNotes = clientGeneralNotes.filter(note =>
    noteMatchesVisibility(note, {
      searchValue: normalizedSearch,
      durationFilter,
      showExpired,
    }),
  );

  function visibleNotesForRecord(noteIds) {
    return noteIds
      .map(noteId => notesById[noteId])
      .filter(Boolean)
      .filter(note =>
        noteMatchesVisibility(note, {
          searchValue: normalizedSearch,
          durationFilter,
          showExpired,
        }),
      );
  }

  const visibleInsights = clientInsights.filter(record => {
    if (sharedFilter === 'shared' && record.sharedStatus !== 'shared') {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    const recordText = `${record.headline} ${record.summary}`.toLowerCase();
    if (recordText.includes(normalizedSearch)) {
      return true;
    }

    return visibleNotesForRecord(record.noteIds).length > 0;
  });

  const visibleEngagements = clientEngagements.filter(engagement => {
    if (!normalizedSearch) {
      return true;
    }

    const engagementText = `${engagement.status} ${channelLabel(engagement.channel)}`.toLowerCase();
    if (engagementText.includes(normalizedSearch)) {
      return true;
    }

    return [
      ...visibleNotesForRecord(engagement.preNoteIds),
      ...visibleNotesForRecord(engagement.postNoteIds),
    ].length > 0;
  });

  const visibleInsightState = getPortalRecordVisibility(visibleInsights, showAllInsights, 2);

  function openComposer(config) {
    setComposerState(config);
  }

  function handleEditNote(note) {
    const scope = note.engagementId
      ? note.engagementPhase === 'pre'
        ? 'engagement-pre'
        : 'engagement-post'
      : note.insightRecordId
        ? 'insight'
        : 'general';

    openComposer({
      mode: 'edit',
      title: 'Edit internal note',
      description: 'Update the internal note without changing where it is stored in the client portal.',
      submitLabel: 'Save changes',
      scope,
      noteId: note.id,
      initialNote: note,
    });
  }

  function submitComposer(note) {
    if (!composerState) {
      return;
    }

    if (composerState.mode === 'edit') {
      dispatch({
        type: 'UPDATE_PORTAL_NOTE',
        noteId: composerState.noteId,
        note: {
          body: note.body,
          durationType: note.durationType,
          expiresOn: note.expiresOn,
        },
      });
      return;
    }

    if (composerState.scope === 'general') {
      dispatch({
        type: 'ADD_PORTAL_NOTE',
        note: {
          clientId: client.id,
          body: note.body,
          relevance: 'general',
          durationType: note.durationType,
          expiresOn: note.expiresOn,
        },
      });
      return;
    }

    if (composerState.scope === 'insight') {
      dispatch({
        type: 'ADD_PORTAL_NOTE',
        note: {
          clientId: client.id,
          body: note.body,
          relevance: 'insight',
          durationType: note.durationType,
          expiresOn: note.expiresOn,
          insightRecordId: composerState.insightRecordId,
        },
      });
      return;
    }

    dispatch({
      type: 'ADD_ENGAGEMENT_NOTE',
      engagementId: composerState.engagementId,
      engagementPhase: composerState.scope === 'engagement-pre' ? 'pre' : 'post',
      note: {
        clientId: client.id,
        body: note.body,
        relevance: 'general',
        durationType: note.durationType,
        expiresOn: note.expiresOn,
      },
    });
  }

  const showGeneralSection = noteTypeFilter === 'all' || noteTypeFilter === 'general';
  const showInsightSection = noteTypeFilter === 'all' || noteTypeFilter === 'insight';
  const showEngagementSection = noteTypeFilter === 'all' || noteTypeFilter === 'engagement';

  return (
    <div className="ri-page portal-page">
      <Link className="portal-breadcrumb" to="/dashboard">
        <ArrowLeft size={20} />
        <span>Back to Dashboard</span>
      </Link>

      <section className="portal-header">
        <h2>Client Portal</h2>
        <p>
          Navigate client profiles, review the full internal history of insights and engagements, and manage internal notes
          without exposing them to the client.
        </p>
      </section>

      <section className="ri-panel portal-filter-panel">
        <div className="portal-filter-panel__row portal-filter-panel__row--full">
          <label className="topbar-field topbar-field--full">
            <span>Client profile</span>
            <select
              aria-label="Client portal client"
              value={client.id}
              onChange={event => dispatch({ type: 'SELECT_CLIENT', clientId: event.target.value })}
            >
              {clients.map(option => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="portal-filter-panel__row portal-filter-panel__row--full">
          <label className="portal-search-field">
            <span>Search</span>
            <div className="portal-search-field__input">
              <Search size={22} />
              <input
                aria-label="Client portal search"
                type="search"
                placeholder="Search notes, insights, and engagements"
                value={searchValue}
                onChange={event => setSearchValue(event.target.value)}
              />
            </div>
          </label>
        </div>

        <div className="portal-filter-panel__row portal-filter-panel__row--filters">
          <label className="topbar-field">
            <span>Insight sharing</span>
            <select aria-label="Insight sharing filter" value={sharedFilter} onChange={event => setSharedFilter(event.target.value)}>
              <option value="all">All insights</option>
              <option value="shared">Shared only</option>
            </select>
          </label>

          <label className="topbar-field">
            <span>Note type</span>
            <select aria-label="Note type filter" value={noteTypeFilter} onChange={event => setNoteTypeFilter(event.target.value)}>
              <option value="all">All sections</option>
              <option value="general">General notes</option>
              <option value="insight">Insights</option>
              <option value="engagement">Engagements</option>
            </select>
          </label>

          <label className="topbar-field">
            <span>Duration</span>
            <select aria-label="Note duration filter" value={durationFilter} onChange={event => setDurationFilter(event.target.value)}>
              <option value="all">All durations</option>
              <option value="permanent">Permanent</option>
              <option value="time-constrained">Time constrained</option>
            </select>
          </label>

          <label className="portal-checkbox">
            <input checked={showExpired} type="checkbox" onChange={event => setShowExpired(event.target.checked)} />
            <span>Show expired</span>
          </label>
        </div>
      </section>

      <div className="portal-sections">
        {showGeneralSection ? (
          <section className="portal-section">
            <div className="portal-section__header">
              <div>
                <h3>General notes</h3>
                <p>{client.name} | Internal relationship context</p>
              </div>
              <button
                type="button"
                className="portal-outline-button"
                onClick={() =>
                  openComposer({
                    mode: 'create',
                    scope: 'general',
                    title: 'Add general note',
                    description: 'This note is stored against the client profile and never reaches the client.',
                    submitLabel: 'Save general note',
                  })
                }
              >
                Add general note
              </button>
            </div>

            <PortalNoteList notes={visibleGeneralNotes} emptyMessage="No general notes match the current filters." onEdit={handleEditNote} />
          </section>
        ) : null}

        {showInsightSection ? (
          <section className="portal-section">
            <div className="portal-section__header">
              <div>
                <h3>Insights</h3>
                <p>All generated insights for this client, including shared and unshared history.</p>
              </div>
            </div>

            <div className="portal-record-stack">
              {visibleInsightState.visibleRecords.length ? (
                visibleInsightState.visibleRecords.map(record => {
                  const recordNotes = visibleNotesForRecord(record.noteIds);
                  const expanded = expandedInsights[record.id] ?? record.isActive;

                  return (
                    <article key={record.id} className="portal-record-card">
                      <div className="portal-record-card__header">
                        <button
                          type="button"
                          className="portal-record-toggle"
                          aria-label={`Toggle insight ${record.headline}`}
                          aria-expanded={expanded}
                          onClick={() =>
                            setExpandedInsights(current => ({
                              ...current,
                              [record.id]: !expanded,
                            }))
                          }
                        >
                          <div className="portal-record-card__summary">
                            <div className="portal-record-card__pills">
                              <StatusPill tone={record.sharedStatus === 'shared' ? 'positive' : 'neutral'}>
                                {record.sharedStatus === 'shared' ? 'Shared' : 'Unshared'}
                              </StatusPill>
                              {record.isActive ? <StatusPill tone="warning">Active</StatusPill> : null}
                              <span className="portal-muted-text">{formatTimestamp(record.generatedAt)}</span>
                            </div>
                            <div className="portal-record-card__copy">
                              <h4>{record.headline}</h4>
                              <p>{record.summary}</p>
                            </div>
                          </div>
                          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>

                        <div className="portal-record-card__actions">
                          <span className="portal-note-count">{recordNotes.length} note{recordNotes.length === 1 ? '' : 's'}</span>
                          <button
                            type="button"
                            className="portal-inline-action"
                            onClick={() =>
                              openComposer({
                                mode: 'create',
                                scope: 'insight',
                                insightRecordId: record.id,
                                title: 'Add insight note',
                                description: 'This note is attached to the selected insight and stays internal only.',
                                submitLabel: 'Save insight note',
                              })
                            }
                          >
                            Add insight note
                          </button>
                        </div>
                      </div>

                      {expanded ? (
                        <div className="portal-record-card__detail">
                          <PortalNoteList notes={recordNotes} emptyMessage="No insight notes match the current filters." onEdit={handleEditNote} />
                        </div>
                      ) : null}
                    </article>
                  );
                })
              ) : (
                <p className="portal-empty-message">No insights match the current filters.</p>
              )}
            </div>

            {visibleInsightState.hasMore ? (
              <button type="button" className="portal-load-more" onClick={() => setShowAllInsights(true)}>
                Load more insights ({visibleInsightState.remainingCount} more)
              </button>
            ) : null}
          </section>
        ) : null}

        {showEngagementSection ? (
          <section className="portal-section">
            <div className="portal-section__header">
              <div>
                <h3>Engagements</h3>
                <p>Advisory engagements are kept separate, with pre- and post-engagement notes grouped clearly.</p>
              </div>
            </div>

            <div className="portal-record-stack">
              {visibleEngagements.length ? (
                visibleEngagements.map(engagement => {
                  const Icon = channelIcon(engagement.channel);
                  const preNotes = visibleNotesForRecord(engagement.preNoteIds);
                  const postNotes = visibleNotesForRecord(engagement.postNoteIds);
                  const expanded = expandedEngagements[engagement.id] ?? false;

                  return (
                    <article key={engagement.id} className="portal-engagement-card">
                      <div className="portal-record-card__header">
                        <button
                          type="button"
                          className="portal-record-toggle portal-record-toggle--engagement"
                          aria-label={`Toggle engagement ${channelLabel(engagement.channel)} ${engagement.status}`}
                          aria-expanded={expanded}
                          onClick={() =>
                            setExpandedEngagements(current => ({
                              ...current,
                              [engagement.id]: !expanded,
                            }))
                          }
                        >
                          <div className="portal-engagement-card__summary">
                            <span className={`portal-engagement-card__icon portal-engagement-card__icon--${engagement.channel}`}>
                              <Icon size={24} />
                            </span>
                            <div className="portal-engagement-card__copy">
                              <div className="portal-engagement-card__headline">
                                <h4>{channelLabel(engagement.channel)}</h4>
                                <span>{formatTimestamp(engagement.confirmedAt)}</span>
                              </div>
                              <p>{channelLabel(engagement.channel)} engagement</p>
                              <strong>{engagement.status}</strong>
                              <span>{preNotes.length + postNotes.length} note{preNotes.length + postNotes.length === 1 ? '' : 's'}</span>
                            </div>
                          </div>
                          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>

                      {expanded ? (
                        <div className="portal-record-card__detail portal-record-card__detail--engagement">
                          <section className="portal-note-group">
                            <div className="portal-note-group__header">
                              <div>
                                <h5>Pre-engagement notes</h5>
                                <p>Captured before the outreach was confirmed.</p>
                              </div>
                              <button
                                type="button"
                                className="portal-inline-action"
                                onClick={() =>
                                  openComposer({
                                    mode: 'create',
                                    scope: 'engagement-pre',
                                    engagementId: engagement.id,
                                    title: 'Add pre-engagement note',
                                    description: 'This note is attached to the pre-engagement record and stays internal only.',
                                    submitLabel: 'Save pre-engagement note',
                                  })
                                }
                              >
                                Add pre-engagement note
                              </button>
                            </div>
                            <PortalNoteList notes={preNotes} emptyMessage="No pre-engagement notes match the current filters." onEdit={handleEditNote} />
                          </section>

                          <section className="portal-note-group">
                            <div className="portal-note-group__header">
                              <div>
                                <h5>Post-engagement notes</h5>
                                <p>Captured after the outreach was confirmed.</p>
                              </div>
                              <button
                                type="button"
                                className="portal-inline-action"
                                onClick={() =>
                                  openComposer({
                                    mode: 'create',
                                    scope: 'engagement-post',
                                    engagementId: engagement.id,
                                    title: 'Add post-engagement note',
                                    description: 'This note is attached to the post-engagement record and stays internal only.',
                                    submitLabel: 'Save post-engagement note',
                                  })
                                }
                              >
                                Add post-engagement note
                              </button>
                            </div>
                            <PortalNoteList notes={postNotes} emptyMessage="No post-engagement notes match the current filters." onEdit={handleEditNote} />
                          </section>
                        </div>
                      ) : null}
                    </article>
                  );
                })
              ) : (
                <p className="portal-empty-message">No engagements match the current filters.</p>
              )}
            </div>
          </section>
        ) : null}
      </div>

      <InternalNoteComposer
        open={Boolean(composerState)}
        onClose={() => setComposerState(null)}
        onSubmit={submitComposer}
        scope={composerState?.scope ?? 'general'}
        title={composerState?.title ?? 'Internal note'}
        description={composerState?.description ?? 'Internal notes stay inside the system.'}
        submitLabel={composerState?.submitLabel ?? 'Save note'}
        initialNote={composerState?.initialNote ?? null}
      />
    </div>
  );
}
