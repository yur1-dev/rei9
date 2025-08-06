"use client";

import { useState } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    // IMPORTANT: For demonstration purposes only.
    // In a real application, this password check MUST be done securely on the server.
    if (password === "reithemoneymaker") {
      setError("");
      onClose(); // Close the modal on successful login
      router.push("/ai-alpha"); // Redirect to the new page
    } else {
      setError("Access Denied. Invalid Cipher.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="bg-gray-900/70 border-green-500/20 backdrop-blur-sm rounded-sm w-full max-w-md p-0"
        style={{
          animation: "none",
          transform: "none",
          transition: "none",
          animationDuration: "0s",
          transitionDuration: "0s",
        }}
      >
        <DialogHeader>
          <DialogTitle className="sr-only">Access Protocol Login</DialogTitle>
        </DialogHeader>
        <div className="py-8 px-6">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-white text-3xl font-black flex items-center justify-center gap-2 font-heading tracking-wide">
              <Lock className="w-7 h-7 text-gray-400" />
              ACCESS PROTOCOL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-400 text-center">
              Enter your Cipher Key to access REI9's AI Alpha Stream.
            </p>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Enter Cipher Key..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/50 border-green-500/50 text-white placeholder-gray-500 rounded-sm focus:border-green-400"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleLogin();
                  }
                }}
              />
              {error && (
                <p className="text-red-400 text-sm flex items-center gap-1 justify-center">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              )}
            </div>
            <Button
              onClick={handleLogin}
              className="w-full bg-green-500 hover:bg-green-400 text-black font-black py-3 text-lg uppercase tracking-wide rounded-sm shadow-[0_0_20px_rgba(34,197,94,0.3)]"
            >
              ACCESS PROTOCOL
            </Button>
            <p className="text-xs text-gray-400 text-center">
              Cipher Keys are unique to your neural imprint.
            </p>
          </CardContent>
        </div>
      </DialogContent>
    </Dialog>
  );
}
