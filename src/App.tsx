import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

// Lazy load pages for code splitting (Micro-optimization #4)
const Home = lazy(() => import("@/pages/Home"));
const Login = lazy(() => import("@/pages/Login"));
const PinEntry = lazy(() => import("@/pages/PinEntry"));

// Loading fallback component
const LoadingScreen = () => (
  <div className="flex h-screen items-center justify-center bg-black text-white">
    <div className="animate-pulse">Loading...</div>
  </div>
);

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, error, checkAuth, isPinVerified } = useAuthStore();
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-black text-white">Loading...</div>;
  }

  if (error && !user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-black text-white gap-4">
        <div className="text-red-500">Unable to verify session: {error}</div>
        <button 
          onClick={() => checkAuth()}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Check Auth first
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Then Check PIN
  if (!isPinVerified) {
    return <PinEntry />;
  }

  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <Suspense fallback={<LoadingScreen />}>
            <Login />
          </Suspense>
        } />
        <Route path="/" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}
