"use client";

import { useAuth } from "@/context/auth-context";
import { LoginModal } from "@/components/login-modal";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Define protected routes
  const protectedRoutes = ["/ai-alpha"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  useEffect(() => {
    if (!isLoading) {
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
    }
  }, [
    isAuthenticated,
    isLoading,
    isProtectedRoute,
    pathname,
    router,
    showLoginModal,
  ]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 text-xl font-bold tracking-wide">
          INITIALIZING PROTOCOL...
        </div>
      </div>
    );
  }

  // If trying to access protected route without authentication
  if (!isAuthenticated && isProtectedRoute) {
    return (
      <>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl font-black text-green-400 mb-4 font-heading tracking-wider">
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
