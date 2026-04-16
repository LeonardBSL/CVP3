import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import DashboardPage from './pages/DashboardPage';
import AlertDetailPage from './pages/engagement/AlertDetailPage';
import InsightReviewPage from './pages/engagement/InsightReviewPage';
import OutreachConfirmPage from './pages/engagement/OutreachConfirmPage';
import OutreachSelectionPage from './pages/engagement/OutreachSelectionPage';
import ClientInsightPage from './pages/insights/ClientInsightPage';
import CustomizeInsightPage from './pages/insights/CustomizeInsightPage';
import DeliveryPage from './pages/insights/DeliveryPage';
import InsightDetailPage from './pages/insights/InsightDetailPage';
import RecommendationPage from './pages/lookup/RecommendationPage';
import ResponsePage from './pages/lookup/ResponsePage';
import SearchPage from './pages/lookup/SearchPage';
import ClientRelevancePage from './pages/sector/ClientRelevancePage';
import DeepDivePage from './pages/sector/DeepDivePage';
import OverviewPage from './pages/sector/OverviewPage';
import ClientPortalPage from './pages/portal/ClientPortalPage';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/portal" element={<ClientPortalPage />} />

        <Route path="/engagement/alert/:alertId" element={<AlertDetailPage />} />
        <Route path="/engagement/insight" element={<InsightReviewPage />} />
        <Route path="/engagement/bundle" element={<Navigate to="/engagement/insight" replace />} />
        <Route path="/engagement/customize" element={<Navigate to="/engagement/insight" replace />} />
        <Route path="/engagement/outreach" element={<OutreachSelectionPage />} />
        <Route path="/engagement/confirm" element={<OutreachConfirmPage />} />

        <Route path="/insights/client" element={<ClientInsightPage />} />
        <Route path="/insights/insight" element={<InsightDetailPage />} />
        <Route path="/insights/customize" element={<CustomizeInsightPage />} />
        <Route path="/insights/benchmarking" element={<Navigate to="/insights/insight" replace />} />
        <Route path="/insights/outlook" element={<Navigate to="/insights/insight" replace />} />
        <Route path="/insights/delivery" element={<DeliveryPage />} />

        <Route path="/lookup/search" element={<SearchPage />} />
        <Route path="/lookup/response" element={<ResponsePage />} />
        <Route path="/lookup/recommendation" element={<RecommendationPage />} />

        <Route path="/sector/overview" element={<OverviewPage />} />
        <Route path="/sector/deep-dive" element={<DeepDivePage />} />
        <Route path="/sector/client-relevance" element={<ClientRelevancePage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppShell>
  );
}
