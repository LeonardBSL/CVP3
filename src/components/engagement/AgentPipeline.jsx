import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

function AgentRow({ agent, index }) {
  const [open, setOpen] = useState(false);
  return (
    <article className={`agent-pipeline__row ${open ? 'agent-pipeline__row--open' : ''}`}>
      <button type="button" className="agent-pipeline__head" aria-expanded={open} onClick={() => setOpen(value => !value)}>
        <span className="agent-pipeline__index">{String(index + 1).padStart(2, '0')}</span>
        <span className="agent-pipeline__labels">
          <strong>{agent.label}</strong>
          <span>{agent.role}</span>
        </span>
        <ChevronDown size={16} />
      </button>
      {open ? <p className="agent-pipeline__body">{agent.contribution}</p> : null}
    </article>
  );
}

export default function AgentPipeline({ title, pipeline }) {
  return (
    <div className="agent-pipeline">
      {title ? <h4 className="agent-pipeline__title">{title}</h4> : null}
      <div className="agent-pipeline__rows">
        {pipeline.agents.map((agent, index) => (
          <AgentRow key={agent.id} agent={agent} index={index} />
        ))}
      </div>
      <article className="agent-pipeline__synthesis">
        <strong>{pipeline.synthesis.label}</strong>
        <span>{pipeline.synthesis.role}</span>
        <p>{pipeline.synthesis.contribution}</p>
      </article>
    </div>
  );
}
