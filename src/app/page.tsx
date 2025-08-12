import { HeroSection } from "@/components/sections/hero-section";
// import { CrewSection } from "@/components/crew-section";
import { MainNavigation } from "@/components/main-navigation";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background Image - covers the full screen */}
      <div className="fixed inset-0 z-0">
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Navigation */}
      <MainNavigation />

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-8 md:py-12">
          <HeroSection />
        </section>

        {/* Crew Section */}
        {/* <CrewSection /> */}

        {/* Footer */}
        <footer className="bg-black border-t border-green-950 py-12">
          <div className="max-w-7xl container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand */}
              <div className="md:col-span-1">
                <div className="text-2xl font-bold text-green-400 mb-4">
                  REI9
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Street Alpha. Solana Domination. The future of digital culture
                  starts here.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-white font-bold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="#features"
                      className="text-gray-400 hover:text-green-400 transition-colors duration-300"
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <a
                      href="#collection"
                      className="text-gray-400 hover:text-green-400 transition-colors duration-300"
                    >
                      Collection
                    </a>
                  </li>
                  <li>
                    <a
                      href="#signals"
                      className="text-gray-400 hover:text-green-400 transition-colors duration-300"
                    >
                      Signals
                    </a>
                  </li>
                  <li>
                    <a
                      href="#crew"
                      className="text-gray-400 hover:text-green-400 transition-colors duration-300"
                    >
                      Crew
                    </a>
                  </li>
                </ul>
              </div>

              {/* Community */}
              <div>
                <h3 className="text-white font-bold mb-4">Community</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-green-400 transition-colors duration-300"
                    >
                      Discord
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-green-400 transition-colors duration-300"
                    >
                      Twitter
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-green-400 transition-colors duration-300"
                    >
                      Telegram
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-green-400 transition-colors duration-300"
                    >
                      Instagram
                    </a>
                  </li>
                </ul>
              </div>

              {/* Newsletter */}
              <div>
                <h3 className="text-white font-bold mb-4">Stay Updated</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Get the latest drops and signals
                </p>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Enter email"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-l-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-400"
                  />
                  <button className="bg-green-500 hover:bg-green-400 px-4 py-2 rounded-r-lg text-black font-bold text-sm transition-colors duration-300">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2024 REI9. All rights reserved. Built on Solana.
              </div>
              <div className="flex space-x-6 text-sm">
                <a
                  href="#"
                  className="text-gray-400 hover:text-green-400 transition-colors duration-300"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-green-400 transition-colors duration-300"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-green-400 transition-colors duration-300"
                >
                  Support
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
