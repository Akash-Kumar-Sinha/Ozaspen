"use client";

import React, { useState, useEffect } from "react";
import { Zap, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import Headers from "./components/Headers";

export default function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen  text-white overflow-hidden relative">
      <div className="absolute inset-0  bg-radial-[at_0%_50%] from-purple-800   to-black bg-gradient  "/>
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-30">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-px h-px bg-blue-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `twinkle ${2 + Math.random() * 3}s infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            ></div>
          ))}
        </div>
      </div>

      <Headers />

      <section className="relative z-10 pt-24 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                Think deeper.
                <br />
                <span className="text-blue-500">Work smarter.</span>
              </h1>

              <p className="text-xl text-gray-400 leading-relaxed mb-10 max-w-xl">
                Build your productivity system with lightning-fast capture,
                relational linking, and AI that understands context. Not just
                another note app.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button className="group px-8 py-4 bg-blue-500 hover:bg-blue-600 rounded-xl font-semibold transition-all flex items-center justify-center">
                  Get Started Free
                  <ArrowRight
                    size={20}
                    className="ml-2 group-hover:translate-x-1 transition-transform"
                  />
                </button>
                <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all">
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center space-x-8">
                <div>
                  <div className="text-3xl font-bold text-white mb-1">50K+</div>
                  <div className="text-sm text-gray-500">Active Users</div>
                </div>
                <div className="w-px h-12 bg-white/10"></div>
                <div>
                  <div className="text-3xl font-bold text-white mb-1">2M+</div>
                  <div className="text-sm text-gray-500">Notes Created</div>
                </div>
                <div className="w-px h-12 bg-white/10"></div>
                <div>
                  <div className="text-3xl font-bold text-white mb-1">4.9★</div>
                  <div className="text-sm text-gray-500">Rating</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div
                className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl transition-all duration-300"
                style={{
                  left: `${mousePosition.x * 0.02}px`,
                  top: `${mousePosition.y * 0.02}px`,
                }}
              ></div>

              <div className="relative">
                <div className="absolute top-8 left-8 w-72 h-80 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm transform rotate-6"></div>

                <div className="absolute top-4 left-4 w-72 h-80 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm transform rotate-3"></div>

                <div className="relative w-72 h-80 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-md p-6 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Today, {new Date().toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Sparkles size={16} className="text-blue-400" />
                      <div className="h-3 w-32 bg-blue-500/30 rounded"></div>
                    </div>

                    <div className="space-y-2">
                      <div className="h-2 w-full bg-white/20 rounded"></div>
                      <div className="h-2 w-5/6 bg-white/20 rounded"></div>
                      <div className="h-2 w-4/6 bg-white/20 rounded"></div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs text-blue-400">
                        #idea
                      </span>
                      <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs text-purple-400">
                        #work
                      </span>
                    </div>

                    <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <div className="w-6 h-6 bg-blue-500/20 border border-blue-500/30 rounded-full"></div>
                        <div className="w-6 h-6 bg-purple-500/20 border border-purple-500/30 rounded-full -ml-2"></div>
                        <div className="w-6 h-6 bg-pink-500/20 border border-pink-500/30 rounded-full -ml-2"></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        3 linked notes
                      </span>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-500/20 border border-blue-500/30 rounded-2xl backdrop-blur-sm flex items-center justify-center animate-bounce">
                  <Zap size={24} className="text-blue-400" />
                </div>

                <div
                  className="absolute -bottom-4 -left-4 w-20 h-20 bg-purple-500/20 border border-purple-500/30 rounded-2xl backdrop-blur-sm p-4"
                  style={{ animation: "float 3s ease-in-out infinite" }}
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
