import { useState } from 'react';
import { milestones, signalsForModule } from '../../../data/intelligenceData';
import IntelModal from '../../../components/intel/IntelModal';
import SignalStrip from '../../../components/intel/SignalStrip';
import SignalIntelligenceSection from '../../../components/intel/SignalIntelligenceSection';

const moduleSignals = signalsForModule('milestones');
const urgentCount = milestones.filter(m => m.urgency === 'urgent').length;

export default function MilestonesModule() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="intel-mod"
        aria-label="Lifecycle Milestones — open RM context"
        onClick={() => setOpen(true)}
      >
        <div className="intel-mod__head intel-mod__head--warning">
          <div className="intel-mod__title intel-mod__title--warning">Lifecycle Milestones</div>
          <span className="intel-ai-badge" aria-label="AI-generated">AI</span>
        </div>
        <div className="intel-mod__body">
          <div className="intel-ml__list">
            {milestones.map(milestone => {
              const isUrgent = milestone.urgency === 'urgent';
              return (
                <div key={milestone.id} className={`intel-ml__item${isUrgent ? ' intel-ml__item--urgent' : ''}`}>
                  <span className={`intel-ml__dot${isUrgent ? ' intel-ml__dot--urgent' : ''}`} aria-hidden="true" />
                  <div className="intel-ml__body">
                    <div className="intel-ml__name">{milestone.name}</div>
                    <div className="intel-ml__meta">{milestone.meta}</div>
                  </div>
                  <span className={`intel-ml__days${isUrgent ? ' intel-ml__days--urgent' : ''}`}>{milestone.daysLabel}</span>
                </div>
              );
            })}
          </div>
          <SignalStrip signals={moduleSignals} />
        </div>
        <div className="intel-mod__foot">
          <span className="intel-mod__foot-meta">{milestones.length} milestones · {urgentCount} need attention</span>
          <span className="intel-mod__foot-hint">RM context →</span>
        </div>
      </button>

      <IntelModal
        open={open}
        title="Client Milestone & Lifecycle Intelligence"
        subtitle={`Nkosi Retail Group · AI-generated · ${milestones.length} active milestones`}
        footerLeft="AI-generated milestone detection. Verify regulatory events directly before acting."
        footerRight="Model: CVP Lifecycle v1.4"
        onClose={() => setOpen(false)}
      >
        <div className="intel-section-title">Active Milestones — RM Context</div>
        {milestones.map(milestone => (
          <div key={milestone.id} className="intel-ml-detail">
            <div className={`intel-ml-detail__head${milestone.urgency === 'urgent' ? ' intel-ml-detail__head--urgent' : ''}`}>
              <span className="intel-ml-detail__title">
                {milestone.urgency === 'urgent' ? '⚠ ' : ''}{milestone.name} — {milestone.daysLabel}
              </span>
              <span className="intel-ml-detail__source">{milestone.source}</span>
            </div>
            <div className="intel-ml-detail__body">
              <div className="intel-ml-detail__row">
                <span className="intel-ml-detail__key">What it is</span>
                <span className="intel-ml-detail__val">{milestone.whatItIs}</span>
              </div>
              <div className="intel-ml-detail__row">
                <span className="intel-ml-detail__key">Why it matters</span>
                <span className="intel-ml-detail__val">{milestone.whyItMatters}</span>
              </div>
              <div className="intel-context-box">
                <strong>RM Conversation Context:</strong> {milestone.rmContext}
              </div>
            </div>
          </div>
        ))}

        <div className="intel-section-title">AI Reasoning</div>
        <div className="intel-reasoning-box">
          Milestones are detected by monitoring CIPC filings, year-end calendar patterns, and BBBEE certification cycles against each client's profile. Urgency is ranked by time to event, financial materiality, and whether the event opens or closes a natural RM conversation window. Governance events such as the director change are prioritised because their action window is short.
        </div>

        <div className="intel-section-title">What the AI is Seeing</div>
        <SignalIntelligenceSection
          signals={moduleSignals}
          connectionLabel="How this affects the Milestones module"
        />
      </IntelModal>
    </>
  );
}
