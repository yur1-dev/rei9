import Image from "next/image";
import { HeroSection } from "@/components/hero-section";
// Removed: import { LoginSection } from "@/components/login-section"; // LoginSection is now a modal
import { MainNavigation } from "@/components/main-navigation";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background Image - already set to cover the full screen */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/placeholder.svg?height=1080&width=1920" // Using placeholder.svg
          alt="Abstract neon street art background"
          width={1920}
          height={1080}
          className="w-full h-full object-cover opacity-30" // object-cover makes it "big" and fills the space
          priority
        />
        {/* Optional: Add a subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <MainNavigation />

      <main className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        <HeroSection />
        {/* LoginSection is now a modal triggered by the MainNavigation, so it's not rendered directly here */}
      </main>
    </div>
  );
}
