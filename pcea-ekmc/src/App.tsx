/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ReactNode, ErrorInfo } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./components/Home";
import SermonLibrary from "./components/SermonLibrary";
import AIAssistant from "./components/AIAssistant";
import PrayerWall from "./components/PrayerWall";
import Testimonies from "./components/Testimonies";
import LiveStream from "./components/LiveStream";
import GroupRegistration from "./components/GroupRegistration";
import Institutions from "./components/Institutions";
import Contact from "./components/Contact";
import MembershipRegistration from "./components/MembershipRegistration";
import AdminDashboard from "./components/AdminDashboard";
import StaffDashboard from "./components/StaffDashboard";
import MemberPortal from "./components/MemberPortal";
import MediaGallery from "./components/MediaGallery";
import SpiritualGuide from "./components/SpiritualGuide";
import SocialDashboard from "./components/SocialDashboard";
import AboutUs from "./components/AboutUs";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

function RoutePersistence() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Restore path on initial load
  React.useEffect(() => {
    const savedPath = localStorage.getItem("lastPath");
    if (savedPath && savedPath !== "/" && savedPath !== location.pathname) {
      navigate(savedPath, { replace: true });
    }
    setIsInitialized(true);
  }, []); // Run once on mount

  // Save path on every change
  React.useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("lastPath", location.pathname);
    }
  }, [location.pathname, isInitialized]);

  return null;
}

function AuthRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const [lastUser, setLastUser] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Only redirect to profile if:
      // 1. User just logged in (lastUser was null, now we have a user)
      // 2. AND we are currently on the home page (root)
      // This prevents redirects on refreshes when the user is already on a specific sub-page
      if (user && !lastUser && location.pathname === "/") {
        navigate("/profile");
      }
      setLastUser(user?.uid || null);
    });
    return () => unsubscribe();
  }, [navigate, lastUser, location.pathname]);

  return null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends (Component as any) {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.error?.message || "{}");
        if (parsed.error) errorMessage = parsed.error;
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-md w-full p-8 bg-card border border-border rounded-[2.5rem] text-center space-y-6 shadow-xl">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h2 className="text-2xl font-bold">Application Error</h2>
            <p className="text-muted-foreground">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, isOnboarded, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!loading && user && !isOnboarded && location.pathname !== "/profile") {
      navigate("/profile");
    }
  }, [user, isOnboarded, loading, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <RoutePersistence />
        <AuthRedirect />
        <Layout>
          <OnboardingGuard>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sermons" element={<SermonLibrary />} />
              <Route path="/bible-ai" element={<AIAssistant />} />
              <Route path="/prayer-wall" element={<PrayerWall />} />
              <Route path="/testimonies" element={<Testimonies />} />
              <Route path="/live" element={<LiveStream />} />
              <Route path="/register-group/:groupName" element={<GroupRegistration />} />
              <Route path="/institutions" element={<Institutions />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/become-member" element={<MembershipRegistration />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/staff" element={<StaffDashboard />} />
              <Route path="/profile" element={<MemberPortal />} />
              <Route path="/gallery" element={<MediaGallery />} />
              <Route path="/spiritual-guide" element={<SpiritualGuide />} />
              <Route path="/social-dashboard" element={<SocialDashboard />} />
              <Route path="/about" element={<AboutUs />} />
            </Routes>
          </OnboardingGuard>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

