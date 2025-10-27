"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowLeft } from "lucide-react";
import { gsap } from "gsap";

const AuthRequired = () => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const icon = iconRef.current;
    const text = textRef.current;
    const button = buttonRef.current;

    if (!container || !icon || !text || !button) return;

    gsap.set([icon, text, button], { opacity: 0, y: 30 });

    const tl = gsap.timeline({ delay: 0.2 });

    tl.to(icon, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "back.out(1.7)",
    })
      .to(
        text,
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.3"
      )
      .to(
        button,
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.2"
      );

    return () => {
      tl.kill();
    };
  }, []);

  const handleGoToLogin = () => {
    gsap.to(buttonRef.current, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        router.push("/login");
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div ref={containerRef} className="text-center max-w-sm w-full">
        <div ref={iconRef} className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>

        <div ref={textRef} className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Authentication Required
          </h1>
          <p className="text-muted-foreground">
            You need to be logged in to access this page. Please sign in to
            continue.
          </p>
        </div>

        <button
          ref={buttonRef}
          onClick={handleGoToLogin}
          className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default AuthRequired;
