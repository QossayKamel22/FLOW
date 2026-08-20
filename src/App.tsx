import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { ProtectedRoute, PublicOnlyRoute } from "./routes/ProtectedRoute";
import { AppShell } from "./layouts/AppShell";
import { LoginPage } from "./features/auth/LoginPage";
import { SignupPage } from "./features/auth/SignupPage";
import { OnboardingPage } from "./features/onboarding/OnboardingPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { LeadsPage } from "./features/leads/LeadsPage";
import { LeadDetailPage } from "./features/leads/LeadDetailPage";
import { CustomersPage } from "./features/customers/CustomersPage";
import { PropertiesPage } from "./features/properties/PropertiesPage";
import { DealsPage } from "./features/deals/DealsPage";
import { FollowupsPage } from "./features/followups/FollowupsPage";
import { CalendarPage } from "./features/calendar/CalendarPage";
import { CopilotPage } from "./features/copilot/CopilotPage";
import { AnalyticsPage } from "./features/analytics/AnalyticsPage";
import { NotificationsPage } from "./features/notifications/NotificationsPage";
import { SettingsPage } from "./features/settings/SettingsPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
              <Route path="/signup" element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="leads" element={<LeadsPage />} />
                <Route path="leads/:id" element={<LeadDetailPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="properties" element={<PropertiesPage />} />
                <Route path="deals" element={<DealsPage />} />
                <Route path="followups" element={<FollowupsPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="copilot" element={<CopilotPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              <Route path="/" element={<Navigate to="/app" replace />} />
              <Route path="*" element={<Navigate to="/app" replace />} />
            </Routes>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
