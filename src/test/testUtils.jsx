import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { DemoStateProvider } from '../state/DemoStateProvider';
import { createBaseState } from '../state/demoState';

export function buildTestState(overrides = {}) {
  const base = createBaseState();
  return {
    ...base,
    ...overrides,
    journeyProgress: {
      ...base.journeyProgress,
      ...overrides.journeyProgress,
    },
    bundleSelection: {
      ...base.bundleSelection,
      ...overrides.bundleSelection,
    },
    insightDrafts: {
      ...base.insightDrafts,
      ...overrides.insightDrafts,
    },
    lookupSession: {
      ...base.lookupSession,
      ...overrides.lookupSession,
    },
  };
}

export function renderApp(route = '/dashboard', stateOverrides = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <DemoStateProvider initialState={buildTestState(stateOverrides)}>
        <App />
      </DemoStateProvider>
    </MemoryRouter>,
  );
}
