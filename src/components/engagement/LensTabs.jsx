import { useRef, useState } from 'react';
import LookupAgentOutput from '../LookupAgentOutput';

const LENS_ORDER = [
  { key: 'strategic', label: 'Strategic' },
  { key: 'financial', label: 'Financial' },
  { key: 'risk', label: 'Risk' },
  { key: 'regulatory', label: 'Regulatory' },
];

export default function LensTabs({ lenses }) {
  const [active, setActive] = useState('strategic');
  const tabRefs = useRef({});
  const presentation = lenses[active];

  function activateTab(key) {
    setActive(key);
    tabRefs.current[key]?.focus();
  }

  function handleKeyDown(e) {
    const currentIndex = LENS_ORDER.findIndex(l => l.key === active);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      activateTab(LENS_ORDER[(currentIndex + 1) % LENS_ORDER.length].key);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      activateTab(LENS_ORDER[(currentIndex - 1 + LENS_ORDER.length) % LENS_ORDER.length].key);
    }
  }

  return (
    <div className="lens-tabs">
      <div
        className="lens-tabs__list"
        role="tablist"
        aria-label="Origination analytical lenses"
        onKeyDown={handleKeyDown}
      >
        {LENS_ORDER.map(lens => (
          <button
            key={lens.key}
            ref={el => { tabRefs.current[lens.key] = el; }}
            id={`lens-tab-${lens.key}`}
            type="button"
            role="tab"
            aria-selected={active === lens.key}
            aria-controls="lens-tabpanel"
            tabIndex={active === lens.key ? 0 : -1}
            className={`lens-tabs__tab ${active === lens.key ? 'lens-tabs__tab--active' : ''}`}
            onClick={() => activateTab(lens.key)}
          >
            {lens.label}
          </button>
        ))}
      </div>
      <div
        id="lens-tabpanel"
        className="lens-tabs__panel"
        role="tabpanel"
        aria-labelledby={`lens-tab-${active}`}
      >
        <LookupAgentOutput presentation={presentation} />
      </div>
    </div>
  );
}
