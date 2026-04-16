import { useState } from 'react';
import { clients } from '../../data/demoData';
import { isPortalNoteExpired } from '../../data/clientPortalData';
import { InternalNoteComposer } from '../../components/InternalNotes';
import { PageHeader, SectionPanel, StatusPill } from '../../components/UI';
import { useDemoState } from '../../state/DemoStateProvider';

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

function NoteRows({ notes, emptyMessage, onEdit }) {
  if (!notes.length) {
    return <p>{emptyMessage}</p>;
  }

  return (
    <div className="note-list">
      {notes.map(note => (
        <article key={note.id} className="note-item">
          <div className="list-item__top">
            <div className="inline-pills">
              <StatusPill tone={noteTone(note)}>{noteDurationLabel(note)}</StatusPill>
              <StatusPill tone="neutral">Updated {formatTimestamp(note.updatedAt)}</StatusPill>
            </div>
            <button
              type="button"
              className="button button--ghost"
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
    <div className="page">
      <PageHeader
        eyebrow="Client Portal"
        title="Client portal"
        description="Navigate client profiles, review the full internal history of insights and engagements, and manage internal notes without exposing them to the client."
      />

      <div className="portal-toolbar">
        <label className="topbar-field">
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

        <label className="topbar-field">
          <span>Search</span>
          <input
            aria-label="Client portal search"
            type="search"
            placeholder="Search notes, insights, and engagements"
            value={searchValue}
            onChange={event => setSearchValue(event.target.value)}
          />
        </label>

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

      <div className="portal-grid">
        {showGeneralSection ? (
          <SectionPanel
            title="General notes"
            subtitle={`${client.name} | Internal relationship context`}
            action={
              <button
                type="button"
                className="button button--ghost"
                onClick={() =>
                  openComposer({
                    mode: 'create',
                    scope: 'general',
                    title: 'Add general client note',
                    description: 'This note is stored against the client profile and never reaches the client.',
                    submitLabel: 'Save general note',
                  })
                }
              >
                Add general note
              </button>
            }
          >
            <div className="portal-section-body">
              <NoteRows notes={visibleGeneralNotes} emptyMessage="No general notes match the current filters." onEdit={handleEditNote} />
            </div>
          </SectionPanel>
        ) : null}

        {showInsightSection ? (
          <SectionPanel
            title="Insights"
            subtitle="All generated insights for this client, including shared and unshared history."
          >
            <div className="portal-section-body portal-record-stack">
              {visibleInsights.length ? (
                visibleInsights.map(record => {
                  const recordNotes = visibleNotesForRecord(record.noteIds);
                  const expanded = expandedInsights[record.id] ?? record.isActive;

                  return (
                    <article key={record.id} className="portal-record-card">
                      <div className="portal-record-card__header">
                        <button
                          type="button"
                          className="portal-record-toggle"
                          onClick={() =>
                            setExpandedInsights(current => ({
                              ...current,
                              [record.id]: !expanded,
                            }))
                          }
                        >
                          <div className="panel-stack">
                            <div className="inline-pills">
                              <StatusPill tone={record.sharedStatus === 'shared' ? 'positive' : 'neutral'}>
                                {record.sharedStatus === 'shared' ? 'Shared' : 'Unshared'}
                              </StatusPill>
                              {record.isActive ? <StatusPill tone="warning">Active</StatusPill> : null}
                              <StatusPill tone="neutral">{formatTimestamp(record.generatedAt)}</StatusPill>
                            </div>
                            <div>
                              <h4>{record.headline}</h4>
                              <p>{record.summary}</p>
                            </div>
                          </div>
                        </button>

                        <div className="portal-record-actions">
                          <StatusPill tone="neutral">{recordNotes.length} note{recordNotes.length === 1 ? '' : 's'}</StatusPill>
                          <button
                            type="button"
                            className="button button--ghost"
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
                        <div className="portal-record-detail">
                          <NoteRows notes={recordNotes} emptyMessage="No insight notes match the current filters." onEdit={handleEditNote} />
                        </div>
                      ) : null}
                    </article>
                  );
                })
              ) : (
                <p>No insights match the current filters.</p>
              )}
            </div>
          </SectionPanel>
        ) : null}

        {showEngagementSection ? (
          <SectionPanel
            title="Engagements"
            subtitle="Advisory engagements are kept separate, with pre- and post-engagement notes grouped clearly."
          >
            <div className="portal-section-body portal-record-stack">
              {visibleEngagements.length ? (
                visibleEngagements.map(engagement => {
                  const preNotes = visibleNotesForRecord(engagement.preNoteIds);
                  const postNotes = visibleNotesForRecord(engagement.postNoteIds);
                  const expanded = expandedEngagements[engagement.id] ?? false;

                  return (
                    <article key={engagement.id} className="portal-record-card">
                      <div className="portal-record-card__header">
                        <button
                          type="button"
                          className="portal-record-toggle"
                          onClick={() =>
                            setExpandedEngagements(current => ({
                              ...current,
                              [engagement.id]: !expanded,
                            }))
                          }
                        >
                          <div className="panel-stack">
                            <div className="inline-pills">
                              <StatusPill tone="neutral">{channelLabel(engagement.channel)}</StatusPill>
                              <StatusPill tone="positive">{engagement.status}</StatusPill>
                              <StatusPill tone="neutral">{formatTimestamp(engagement.confirmedAt)}</StatusPill>
                            </div>
                            <div>
                              <h4>{channelLabel(engagement.channel)} engagement</h4>
                              <p>{engagement.status}</p>
                            </div>
                          </div>
                        </button>

                        <div className="portal-record-actions">
                          <StatusPill tone="neutral">{preNotes.length + postNotes.length} note{preNotes.length + postNotes.length === 1 ? '' : 's'}</StatusPill>
                        </div>
                      </div>

                      {expanded ? (
                        <div className="portal-record-detail portal-engagement-detail">
                          <div className="portal-note-group">
                            <div className="panel-header">
                              <div>
                                <h3>Pre-engagement notes</h3>
                                <p>Captured before the outreach was confirmed.</p>
                              </div>
                              <button
                                type="button"
                                className="button button--ghost"
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
                            <NoteRows notes={preNotes} emptyMessage="No pre-engagement notes match the current filters." onEdit={handleEditNote} />
                          </div>

                          <div className="portal-note-group">
                            <div className="panel-header">
                              <div>
                                <h3>Post-engagement notes</h3>
                                <p>Captured after the outreach was confirmed.</p>
                              </div>
                              <button
                                type="button"
                                className="button button--ghost"
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
                            <NoteRows notes={postNotes} emptyMessage="No post-engagement notes match the current filters." onEdit={handleEditNote} />
                          </div>
                        </div>
                      ) : null}
                    </article>
                  );
                })
              ) : (
                <p>No engagements match the current filters.</p>
              )}
            </div>
          </SectionPanel>
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
