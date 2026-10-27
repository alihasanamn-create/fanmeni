import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PageIntroGate from "./components/PageIntroGate";
import Home from "./pages/Home";
import HomeRiyadha from "./pages/HomeRiyadha";
import ProgramsPage from "./pages/ProgramsPage";
import ArtsResultsPage from "./pages/ArtsResultsPage";
import SportsResultsPage from "./pages/SportsResultsPage";
import TeamPointsPage from "./pages/TeamPointsPage";
import BroadcastScreen from "./pages/BroadcastScreen";
import ScreenPage from "./pages/ScreenPage";
import PublicStudentsSearch from "./pages/PublicStudentsSearch";
import StudentProfilePage from "./pages/StudentProfilePage";
import PublicAnalyticsPage from "./pages/PublicAnalyticsPage";
import PublicPersonalPointsPage from "./pages/PublicPersonalPointsPage";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import StudentsDashboard from "./pages/StudentsDashboard";
import TeamsDashboard from "./pages/TeamsDashboard";
import ArtsDashboard from "./pages/ArtsDashboard";
import SportsDashboard from "./pages/SportsDashboard";
import CandidatesDashboard from "./pages/CandidatesDashboard";
import CaptainsDashboard from "./pages/CaptainsDashboard";
import CaptainSubmissionsDashboard from "./pages/CaptainSubmissionsDashboard";
import ResultsDashboard from "./pages/ResultsDashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import SettingsDashboard from "./pages/SettingsDashboard";
import BroadcastQueue from "./pages/BroadcastQueue";
import PDFDashboard from "./pages/PDFDashboard";
import PersonalPointsDashboard from "./pages/PersonalPointsDashboard";

const DASHBOARD_ROLES = ["admin", "captain"];

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main web address: FANMENI Home, with the Home intro on refresh. */}
        <Route
          path="/"
          element={
            <PageIntroGate>
              <Home />
            </PageIntroGate>
          }
        />

        <Route
          path="/home"
          element={
            <PageIntroGate>
              <Home />
            </PageIntroGate>
          }
        />
        <Route
          path="/riyadha"
          element={
            <PageIntroGate>
              <HomeRiyadha />
            </PageIntroGate>
          }
        />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/arts-results" element={<ArtsResultsPage />} />
        <Route path="/sports-results" element={<SportsResultsPage />} />
        <Route path="/team-points" element={<TeamPointsPage />} />
        <Route
          path="/live"
          element={
            <PageIntroGate>
              <BroadcastScreen />
            </PageIntroGate>
          }
        />
        <Route
          path="/screen"
          element={
            <PageIntroGate>
              <ScreenPage />
            </PageIntroGate>
          }
        />
        <Route path="/students-public" element={<PublicStudentsSearch />} />
        <Route path="/student/:studentId" element={<StudentProfilePage />} />
        <Route path="/analytics-public" element={<PublicAnalyticsPage />} />
        <Route path="/personal-points-public" element={<PublicPersonalPointsPage />} />
        <Route
          path="/login"
          element={
            <PageIntroGate>
              <LoginPage />
            </PageIntroGate>
          }
        />

        {/* Private admin/captain dashboard. Unauthenticated visitors are sent to /login. */}
        <Route element={<ProtectedRoute allowedRoles={DASHBOARD_ROLES} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/students" element={<StudentsDashboard />} />
            <Route path="/teams" element={<TeamsDashboard />} />
            <Route path="/arts" element={<ArtsDashboard />} />
            <Route path="/sports" element={<SportsDashboard />} />
            <Route path="/candidates" element={<CandidatesDashboard />} />
            <Route path="/captains" element={<CaptainsDashboard />} />
            <Route path="/captain-submissions" element={<CaptainSubmissionsDashboard />} />
            <Route path="/results" element={<ResultsDashboard />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/settings" element={<SettingsDashboard />} />
            <Route path="/live-publish" element={<BroadcastQueue />} />
            <Route path="/broadcast-queue" element={<BroadcastQueue />} />
            <Route path="/pdf" element={<PDFDashboard />} />
            <Route path="/personal-points" element={<PersonalPointsDashboard />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["captain"]} />}>
          <Route path="/captain" element={<Navigate to="/dashboard" replace />} />
          <Route path="/captain/candidates" element={<Navigate to="/candidates" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
