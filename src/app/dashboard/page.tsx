import { AITradeDetails } from "@/components/ai-trade-details";
import { MainNavigation } from "@/components/main-navigation";
import { AlphaCalls } from "@/components/ui/alpha-calls";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Abstract background pattern for a digital street vibe */}
      <div className="fixed inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-950 via-black to-black" />
      <div className="fixed inset-0 opacity-5 bg-[linear-gradient(rgba(34,197,94,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <MainNavigation />

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8 md:py-12">
        <div className="space-y-12">
          {/* Alpha Calls Section - Token categorization */}
          <div className="pt-40 flex items-center justify-center">
            <AlphaCalls />
          </div>

          {/* AI Trade Details Section */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <AITradeDetails />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
