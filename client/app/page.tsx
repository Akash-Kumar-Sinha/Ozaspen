"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import Headers from "@/components/Home/Headers";

export default function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [starCount, setStarCount] = useState(100);
  const [isClient, setIsClient] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    setIsClient(true);
    
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }));
    };
    
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setStarCount(50);
      } else if (width < 1024) {
        setStarCount(75);
      } else {
        setStarCount(100);
      }
    };

    handleResize();
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(timeInterval);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative flex flex-col">
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-40">
          {isClient && [...Array(starCount)].map((_, i) => {
            const seedX = (i * 37) % 100;
            const seedY = (i * 73) % 100;
            const seedDuration = 2 + (i % 3);
            const seedDelay = (i % 20) / 10;
            
            return (
              <div
                key={i}
                className="absolute w-px h-px bg-blue-400 rounded-full animate-pulse"
                style={{
                  left: `${seedX}%`,
                  top: `${seedY}%`,
                  animation: `twinkle ${seedDuration}s infinite`,
                  animationDelay: `${seedDelay}s`,
                }}
              ></div>
            );
          })}
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
      </div>

      <Headers />

      <section className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center justify-items-center lg:justify-items-stretch">
            <div className="text-center lg:text-left order-2 lg:order-1 w-full max-w-2xl lg:max-w-none">
              <div className="mb-6 sm:mb-8">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-6xl font-bold leading-tight mb-4 sm:mb-6">
                  <span className="inline-block transform hover:scale-105 transition-transform duration-300">
                    Think
                  </span>{" "}
                  <span className="inline-block transform hover:scale-105 transition-transform duration-300 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    deeper.
                  </span>
                  <br />
                  <span className="inline-block transform hover:scale-105 transition-transform duration-300">
                    Work
                  </span>{" "}
                  <span className="inline-block transform hover:scale-105 transition-transform duration-300 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                    smarter.
                  </span>
                </h1>
              </div>

              <div className="mb-8 sm:mb-10 lg:mb-12">
                <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Build your{" "}
                  <span className="text-blue-400 font-semibold">
                    productivity system
                  </span>{" "}
                  with lightning-fast capture, relational linking, and{" "}
                  <span className="text-purple-400 font-semibold">
                    AI that understands context
                  </span>
                  .
                </p>
                <p className="text-base sm:text-lg lg:text-xl text-gray-400 mt-3 max-w-2xl mx-auto lg:mx-0">
                  Not just another note app—it&apos;s your{" "}
                  <span className="text-pink-400 font-semibold italic">
                    second brain
                  </span>
                  .
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8 sm:mb-10 lg:mb-12 justify-center lg:justify-start max-w-lg mx-auto lg:mx-0">
                <button className="group px-6 sm:px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-105">
                  <span className="whitespace-nowrap">Get Started Free</span>
                  <ArrowRight
                    size={20}
                    className="ml-2 group-hover:translate-x-1 transition-transform"
                  />
                </button>
                <button className="px-6 sm:px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/30 rounded-xl font-semibold transition-all duration-300 text-white backdrop-blur-sm">
                  <span className="whitespace-nowrap">Watch Demo</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-md mx-auto lg:mx-0">
                <div className="text-center lg:text-left group cursor-pointer">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    50K+
                  </div>
                  <div className="text-sm text-gray-400 leading-tight">
                    Active Users
                  </div>
                </div>
                <div className="text-center lg:text-left group cursor-pointer border-l border-r border-white/10 px-4">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
                    2M+
                  </div>
                  <div className="text-sm text-gray-400 leading-tight">
                    Notes Created
                  </div>
                </div>
                <div className="text-center lg:text-left group cursor-pointer">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 group-hover:text-pink-400 transition-colors">
                    4.9★
                  </div>
                  <div className="text-sm text-gray-400 leading-tight">
                    Rating
                  </div>
                </div>
              </div>
            </div>

            <div className="relative order-1 lg:order-2 flex justify-center lg:justify-start w-full px-8 lg:px-0">
              <div
                className="absolute w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl transition-all duration-500 ease-out"
                style={{
                  left: `${mousePosition.x * 0.01}px`,
                  top: `${mousePosition.y * 0.01}px`,
                }}
              ></div>

              <div className="relative flex justify-center items-center min-h-[400px] w-full">
                <div className="absolute w-64 sm:w-72 lg:w-80 h-64 sm:h-72 lg:h-80 bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-2xl backdrop-blur-sm transform rotate-6 hover:rotate-12 transition-transform duration-500 translate-x-4 translate-y-4"></div>

                <div className="absolute w-64 sm:w-72 lg:w-80 h-64 sm:h-72 lg:h-80 bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-2xl backdrop-blur-sm transform rotate-3 hover:rotate-6 transition-transform duration-500 translate-x-2 translate-y-2"></div>

                <div className="relative w-64 sm:w-72 lg:w-80 h-64 sm:h-72 lg:h-80 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl backdrop-blur-md p-4 sm:p-6 hover:scale-105 hover:border-blue-400/30 transition-all duration-300 group cursor-pointer z-10">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <div
                        className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"
                        style={{ animationDelay: "0.5s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                        style={{ animationDelay: "1s" }}
                     ></div>
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                      {currentTime || "00:00"}
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-white/20 rounded group-hover:bg-white/30 transition-colors"></div>
                      <div className="h-2 w-5/6 bg-white/20 rounded group-hover:bg-white/30 transition-colors"></div>
                      <div className="h-2 w-4/6 bg-white/20 rounded group-hover:bg-white/30 transition-colors"></div>
                      <div className="h-2 w-3/6 bg-white/20 rounded group-hover:bg-white/30 transition-colors"></div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-4">
                      <span className="px-2 sm:px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs text-blue-400 hover:bg-blue-500/30 transition-colors">
                        AI-Powered
                      </span>
                      <span className="px-2 sm:px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs text-purple-400 hover:bg-purple-500/30 transition-colors">
                        Smart
                      </span>
                      <span className="px-2 sm:px-3 py-1 bg-pink-500/20 border border-pink-500/30 rounded-full text-xs text-pink-400 hover:bg-pink-500/30 transition-colors">
                        Fast
                      </span>
                    </div>

                    <div className="pt-4 sm:pt-6 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-500/20 to-blue-500/40 border border-blue-500/30 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                        </div>
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-purple-500/20 to-purple-500/40 border border-purple-500/30 rounded-full -ml-2 flex items-center justify-center">
                          <div
                            className="w-2 h-2 bg-purple-400 rounded-full animate-ping"
                            style={{ animationDelay: "0.5s" }}
                          ></div>
                        </div>
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-pink-500/20 to-pink-500/40 border border-pink-500/30 rounded-full -ml-2 flex items-center justify-center">
                          <div
                            className="w-2 h-2 bg-pink-400 rounded-full animate-ping"
                            style={{ animationDelay: "1s" }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                        <span className="hidden sm:inline">3 linked </span>
                        notes
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="hidden lg:block absolute w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl backdrop-blur-sm p-2 sm:p-4 hover:scale-110 transition-transform cursor-pointer z-20"
                  style={{
                    animation: "float 3s ease-in-out infinite",
                    bottom: "0.5rem",
                    left: "6rem",
                  }}
                >
                  <div className="space-y-1">
                    <div className="h-1 w-full bg-purple-400/50 rounded"></div>
                    <div className="h-1 w-4/5 bg-purple-400/50 rounded"></div>
                    <div className="h-1 w-3/5 bg-purple-400/50 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
