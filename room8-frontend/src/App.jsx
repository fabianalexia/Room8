import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { requestNotificationPermission } from "./notifications";

import Header        from "./components/Header";
import Footer        from "./components/Footer";
import BottomNav     from "./components/BottomNav";
import ProtectedRoute from "./ProtectedRoute";

import Home                  from "./Home";
import Purpose               from "./Purpose";
import SchoolsPage           from "./pages/SchoolsPage";
import LoginPage             from "./pages/LoginPage";
import RegisterPage          from "./pages/RegisterPage";
import ForgotPasswordPage    from "./pages/ForgotPasswordPage";
import ResetPasswordPage     from "./pages/ResetPasswordPage";
import SetupPage              from "./pages/SetupPage";
import ProfileSetupPage      from "./pages/ProfileSetupPage";
import OnboardingSchoolPage   from "./pages/OnboardingSchoolPage";
import OnboardingLifestylePage from "./pages/OnboardingLifestylePage";
import ProfilePage             from "./pages/ProfilePage";
import LikesPage               from "./pages/LikesPage";
import DiscoverPage            from "./pages/DiscoverPage";
import SwipeDeck               from "./components/SwipeDeck";
import MessagesPage            from "./MessagesPage";
import AuthCallbackPage        from "./pages/AuthCallbackPage";
import PrivacyPage             from "./pages/PrivacyPage";
import TermsPage               from "./pages/TermsPage";

// Pages that replace the global chrome with their own nav
const APP_PAGES = ["/app", "/messages", "/discover", "/profile", "/likes", "/setup", "/onboarding/school", "/onboarding/lifestyle", "/profile/setup"];

function AppShell() {
  return (
    <div style={{
      height: "calc(100vh - 64px)",
      overflow: "hidden",
      backgroundColor: "#030914",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <SwipeDeck />
    </div>
  );
}

function Layout() {
  const { pathname } = useLocation();
  const isAppPage = APP_PAGES.some((p) => pathname.startsWith(p));

  return (
    <>
      {/* Global header — hidden on authenticated app pages */}
      {!isAppPage && <Header />}

      <Routes>
        <Route path="/"              element={<Home />} />
        <Route path="/purpose"       element={<Purpose />} />
        <Route path="/schools"       element={<SchoolsPage />} />
        <Route path="/login"            element={<LoginPage />} />
        <Route path="/register"         element={<RegisterPage />} />
        <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
        <Route path="/reset-password"   element={<ResetPasswordPage />} />

        <Route path="/setup" element={
          <ProtectedRoute><SetupPage /></ProtectedRoute>
        } />
        <Route path="/profile/setup" element={
          <ProtectedRoute><ProfileSetupPage /></ProtectedRoute>
        } />
        <Route path="/onboarding/school" element={
          <ProtectedRoute><OnboardingSchoolPage /></ProtectedRoute>
        } />
        <Route path="/onboarding/lifestyle" element={
          <ProtectedRoute><OnboardingLifestylePage /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
        <Route path="/likes" element={
          <ProtectedRoute><LikesPage /></ProtectedRoute>
        } />
        <Route path="/discover" element={
          <ProtectedRoute><DiscoverPage /></ProtectedRoute>
        } />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/privacy"      element={<PrivacyPage />} />
        <Route path="/terms"        element={<TermsPage />} />
        <Route path="/find" element={<Navigate to="/discover" replace />} />
        <Route path="/messages" element={
          <ProtectedRoute><MessagesPage /></ProtectedRoute>
        } />
        <Route path="/app" element={
          <ProtectedRoute requireComplete><AppShell /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Bottom nav — shown on authenticated app pages */}
      {isAppPage && <BottomNav />}

      {/* Footer — hidden on app pages (BottomNav takes its place) */}
      {!isAppPage && <Footer />}
    </>
  );
}

export default function App() {
  useEffect(() => { requestNotificationPermission(); }, []);
  return <Layout />;
}
