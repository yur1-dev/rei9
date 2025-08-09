"use client";
import { useAuth } from "@/context/auth-context";
import type React from "react";

import { LoginModal } from "@/components/login-modal";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
}

const LoadingCounter = () => {
  const [count, setCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const duration = 2500; // 2.5 seconds total
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);

      setCount(progress);

      if (progress >= 100) {
        clearInterval(timer);
        setCount(100); // Ensure it's exactly 100
        setIsComplete(true);
      }
    }, 16); // ~60fps

    return () => clearInterval(timer);
  }, []);

  return {
    component: (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-8">
          {/* Main Logo */}
          <div className="text-6xl font-black text-green-400 mb-8 font-heading tracking-wider">
            REI9
          </div>

          {/* Loading Text */}
          <div className="text-green-400 text-xl font-bold tracking-wide mb-6">
            INITIALIZING PROTOCOL...
          </div>

          {/* Progress Bar Container */}
          <div className="w-80 mx-auto">
            <div className="bg-gray-800 h-2 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-100 ease-out"
                style={{ width: `${count}%` }}
              />
            </div>

            {/* Percentage Counter */}
            <div className="text-green-400 text-3xl font-mono font-bold tracking-wider">
              {Math.floor(count)}%
            </div>
          </div>

          {/* Loading Dots Animation */}
          <div className="flex justify-center space-x-2 mt-6">
            <div
              className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
              style={{ animationDelay: "200ms" }}
            />
            <div
              className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
              style={{ animationDelay: "400ms" }}
            />
          </div>

          {/* Status Text */}
          <div className="text-gray-500 text-sm font-mono mt-4">
            {count < 25 && "Connecting to network..."}
            {count >= 25 && count < 50 && "Verifying credentials..."}
            {count >= 50 && count < 75 && "Loading user data..."}
            {count >= 75 && count < 95 && "Finalizing setup..."}
            {count >= 95 && count < 100 && "Almost ready..."}
            {count >= 100 && "Complete!"}
          </div>
        </div>
      </div>
    ),
    isComplete,
  };
};

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Define protected routes
  const protectedRoutes = ["/ai-alpha"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const loadingCounter = LoadingCounter();

  useEffect(() => {
    // Only proceed after loading animation is complete AND auth is not loading
    if (loadingCounter.isComplete && !isLoading) {
      // Add a small delay to show "Complete!" message
      setTimeout(() => {
        setShowLoading(false);

        if (!isAuthenticated && isProtectedRoute) {
          setShowLoginModal(true);
        } else if (isAuthenticated && showLoginModal) {
          setShowLoginModal(false);
          // If user just authenticated and we're not on ai-alpha, redirect there
          if (pathname !== "/ai-alpha") {
            router.push("/ai-alpha");
          }
        } else {
          setShowLoginModal(false);
        }
      }, 500); // Show "Complete!" for 500ms
    }
  }, [
    loadingCounter.isComplete,
    isAuthenticated,
    isLoading,
    isProtectedRoute,
    pathname,
    router,
    showLoginModal,
  ]);

  // Show loading state while checking authentication OR while animation is running
  if (isLoading || showLoading) {
    return loadingCounter.component;
  }

  // If trying to access protected route without authentication
  if (!isAuthenticated && isProtectedRoute) {
    return (
      <>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl font-black text-green-400 mb-8 font-heading tracking-wider">
              REI9
            </div>
            <div className="text-gray-400 text-lg">
              Access Protocol Required
            </div>
          </div>
        </div>
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => {}} // Don't allow closing without authentication
        />
      </>
    );
  }

  // Render the content (authenticated or public routes)
  return <>{children}</>;
};
