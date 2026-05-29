import { useState } from 'react';
import { newsItems } from '../../../data/intelligenceData';
import { sourceBadgeClass, sourceLabel } from '../../../components/intel/intelFormat';
import IntelModal from '../../../components/intel/IntelModal';

const URGENCY_META = {
  act: { label: 'Act Now', cardMod: 'act', pillMod: 'act' },
  monitor: { label: 'Monitor', cardMod: 'monitor', pillMod: 'monitor' },
  context: { label: 'Context', cardMod: 'context', pillMod: 'context' },
};

const counts = {
  act: newsItems.filter(n => n.urgency === 'act').length,
  monitor: newsItems.filter(n => n.urgency === 'monitor').length,
  context: newsItems.filter(n => n.urgency === 'context').length,
};

const dailyBrief =
  'Two signals require RM action today. A competitor loyalty programme launch (Pick n Pay Smart Shopper expansion) directly targets Nkosi’s core customer base — make contact before the client sees coverage. Separately, a FMCG distributor price hike of 8% from July introduces a cost-push risk to creditor days and gross margin. Three further signals provide context: Shoprite’s strong results confirm sector tailwinds, load-shedding margin data reframes the client’s benchmarking position favourably, and a dti BBBEE consultation adds urgency to the Q3 milestone calendar.';

const MODULE_LABEL = {
  health: 'Health Score',
  milestones: 'Milestones',
  benchmarking: 'Benchmarking',
  diagnostic: 'Diagnostic',
};

// Trim the relevance assessment to its first sentence for the compact card "why" line.
function shortWhy(text) {
  const firstSentence = text.split('. ')[0];
  return firstSentence.length > 90 ? `${firstSentence.slice(0, 87)}…` : `${firstSentence}.`;
}

export default function NewsMonitorModule() {
  const [open, setOpen] = useState(false);

  // Card shows the first five items in a 2-col grid; the fifth spans full width.
  const cardItems = newsItems.slice(0, 5);

  return (
    <>
      <button
        type="button"
        className="intel-mod"
        aria-label="External News & Event Monitor — open full feed"
        onClick={() => setOpen(true)}
      >
        <div className="intel-mod__head intel-mod__head--accent">
          <div className="intel-mod__title intel-mod__title--accent">External News &amp; Event Monitor</div>
          <span className="intel-ai-badge" aria-label="AI-generated">AI</span>
        </div>
        <div className="intel-mod__body">
          <div className="intel-news__live">
            <span className="intel-pulse" aria-hidden="true" />
            <span className="intel-news__live-label">Live Feed</span>
            <span className="intel-news__live-meta">Last scan: 09:14 · 4-hour interval</span>
          </div>
          <div className="intel-news__counts">
            <div className="intel-news__count intel-news__count--red"><span className="intel-news__count-val">{counts.act}</span><span className="intel-news__count-lbl">Act Now</span></div>
            <div className="intel-news__count"><span className="intel-news__count-val">{counts.monitor}</span><span className="intel-news__count-lbl">Monitor</span></div>
            <div className="intel-news__count"><span className="intel-news__count-val">{counts.context}</span><span className="intel-news__count-lbl">Context</span></div>
          </div>
          <div className="intel-news__grid">
            {cardItems.map((item, index) => {
              const meta = URGENCY_META[item.urgency];
              const isFull = index === 4;
              return (
                <div key={item.id} className={`intel-news__card intel-news__card--${meta.cardMod}${isFull ? ' intel-news__card--full' : ''}`}>
                  <div className="intel-news__card-top">
                    <span className={`intel-news__src ${sourceBadgeClass(item.sourceType)}`}>{sourceLabel(item.sourceType)}</span>
                    <span className="intel-news__time">{item.time.split(' · ')[0]}</span>
                  </div>
                  <div className="intel-news__headline">{item.headline}</div>
                  <div className="intel-news__why"><strong>Why:</strong> {shortWhy(item.relevanceAssessment)}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="intel-mod__foot">
          <span className="intel-mod__foot-meta">{newsItems.length} signals · {counts.act} need RM action</span>
          <span className="intel-mod__foot-hint">Open full feed →</span>
        </div>
      </button>

      <IntelModal
        open={open}
        title="External News & Event Monitoring"
        subtitle={`Nkosi Retail Group · AI-curated · ${newsItems.length} signals · Last scan 09:14`}
        footerLeft="AI-curated feed. Relevance assessments are AI-generated — apply professional judgement."
        footerRight="CVP News Monitor v1.8 · Scan interval: 4 hours"
        onClose={() => setOpen(false)}
      >
        <div className="intel-news__brief">
          <div className="intel-news__brief-head">
            <span className="intel-pulse" aria-hidden="true" />
            <span className="intel-news__brief-title">AI Daily Brief</span>
            <span className="intel-news__brief-time">29 May 2026, 09:14</span>
          </div>
          <div className="intel-news__brief-text">{dailyBrief}</div>
        </div>

        <div className="intel-section-title">All Signals</div>
        {newsItems.map(item => {
          const meta = URGENCY_META[item.urgency];
          return (
            <div key={item.id} className="intel-news-item">
              <div className={`intel-news-item__head ${sourceBadgeClass(item.sourceType)}`}>
                <span className="intel-news-item__src">{item.sourceName}</span>
                <span className="intel-news-item__time">{item.time}</span>
                <span className={`intel-news__pill intel-news__pill--${meta.pillMod}`}>{meta.label}</span>
              </div>
              <div className="intel-news-item__body">
                <div className="intel-news-item__headline">{item.headline}</div>
                <div className="intel-news-item__excerpt">{item.excerpt}</div>
                <div className="intel-news-item__assessment">
                  <div className="intel-news-item__assessment-label">AI Relevance Assessment</div>
                  <div className="intel-news-item__assessment-text">{item.relevanceAssessment}</div>
                  <div className="intel-news-item__modules">
                    {item.affectedModules.map(mod => (
                      <span key={mod} className="intel-news-item__module-tag">→ {MODULE_LABEL[mod] ?? mod}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </IntelModal>
    </>
  );
}
