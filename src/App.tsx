import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { ProtectedRoute, PublicOnlyRoute } from "./routes/ProtectedRoute";
import { AppShell } from "./layouts/AppShell";
import { LoadingScreen } from "./components/common/LoadingScreen";
import { NotFoundPage } from "./features/misc/NotFoundPage";

const LoginPage = lazy(() => import("./features/auth/LoginPage").then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import("./features/auth/SignupPage").then((m) => ({ default: m.SignupPage })));
const OnboardingPage = lazy(() => import("./features/onboarding/OnboardingPage").then((m) => ({ default: m.OnboardingPage })));
const DashboardPage = lazy(() => import("./features/dashboard/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const LeadsPage = lazy(() => import("./features/leads/LeadsPage").then((m) => ({ default: m.LeadsPage })));
const LeadDetailPage = lazy(() => import("./features/leads/LeadDetailPage").then((m) => ({ default: m.LeadDetailPage })));
const CustomersPage = lazy(() => import("./features/customers/CustomersPage").then((m) => ({ default: m.CustomersPage })));
const CustomerDetailPage = lazy(() => import("./features/customers/CustomerDetailPage").then((m) => ({ default: m.CustomerDetailPage })));
const PropertiesPage = lazy(() => import("./features/properties/PropertiesPage").then((m) => ({ default: m.PropertiesPage })));
const PropertyDetailPage = lazy(() => import("./features/properties/PropertyDetailPage").then((m) => ({ default: m.PropertyDetailPage })));
const DealsPage = lazy(() => import("./features/deals/DealsPage").then((m) => ({ default: m.DealsPage })));
const DealDetailPage = lazy(() => import("./features/deals/DealDetailPage").then((m) => ({ default: m.DealDetailPage })));
const FollowupsPage = lazy(() => import("./features/followups/FollowupsPage").then((m) => ({ default: m.FollowupsPage })));
const CalendarPage = lazy(() => import("./features/calendar/CalendarPage").then((m) => ({ default: m.CalendarPage })));
const CopilotPage = lazy(() => import("./features/copilot/CopilotPage").then((m) => ({ default: m.CopilotPage })));
const AnalyticsPage = lazy(() => import("./features/analytics/AnalyticsPage").then((m) => ({ default: m.AnalyticsPage })));
const NotificationsPage = lazy(() => import("./features/notifications/NotificationsPage").then((m) => ({ default: m.NotificationsPage })));
const SettingsPage = lazy(() => import("./features/settings/SettingsPage").then((m) => ({ default: m.SettingsPage })));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <Suspense fallback={<LoadingScreen />}>
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
                  <Route path="customers/:id" element={<CustomerDetailPage />} />
                  <Route path="properties" element={<PropertiesPage />} />
                  <Route path="properties/:id" element={<PropertyDetailPage />} />
                  <Route path="deals" element={<DealsPage />} />
                  <Route path="deals/:id" element={<DealDetailPage />} />
                  <Route path="followups" element={<FollowupsPage />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="copilot" element={<CopilotPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                <Route path="/" element={<Navigate to="/app" replace />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
