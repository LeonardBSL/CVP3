import HealthScoreModule from './modules/HealthScoreModule';
import MilestonesModule from './modules/MilestonesModule';
import NewsMonitorModule from './modules/NewsMonitorModule';
import BenchmarkingModule from './modules/BenchmarkingModule';
import DiagnosticModule from './modules/DiagnosticModule';

export default function IntelligenceDashboard() {
  return (
    <div className="intel-dashboard">
      <div className="intel-row-1">
        <HealthScoreModule />
        <MilestonesModule />
        <NewsMonitorModule />
      </div>
      <div className="intel-row-2">
        <BenchmarkingModule />
        <DiagnosticModule />
      </div>
    </div>
  );
}
