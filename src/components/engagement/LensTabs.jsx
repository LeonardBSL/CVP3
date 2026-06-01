import { useState } from 'react';
import LookupAgentOutput from '../LookupAgentOutput';

const LENS_ORDER = [
  { key: 'strategic', label: 'Strategic' },
  { key: 'financial', label: 'Financial' },
  { key: 'risk', label: 'Risk' },
  { key: 'regulatory', label: 'Regulatory' },
];

export default function LensTabs({ lenses }) {
  const [active, setActive] = useState('strategic');
  const presentation = lenses[active];

  return (
    <div className="lens-tabs">
      <div className="lens-tabs__list" role="tablist" aria-label="Origination analytical lenses">
        {LENS_ORDER.map(lens => (
          <button
            key={lens.key}
            type="button"
            role="tab"
            aria-selected={active === lens.key}
            className={`lens-tabs__tab ${active === lens.key ? 'lens-tabs__tab--active' : ''}`}
            onClick={() => setActive(lens.key)}
          >
            {lens.label}
          </button>
        ))}
      </div>
      <div className="lens-tabs__panel" role="tabpanel">
        <LookupAgentOutput presentation={presentation} />
      </div>
    </div>
  );
}
