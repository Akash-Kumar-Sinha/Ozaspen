"use client";

import { useEffect, useRef } from "react";

const Login = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.style.opacity = "0";
      cardRef.current.style.transform = "translateY(20px)";

      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.style.transition = "all 0.6s ease-out";
          cardRef.current.style.opacity = "1";
          cardRef.current.style.transform = "translateY(0)";
        }
      }, 100);
    }

    if (titleRef.current) {
      titleRef.current.style.opacity = "0";
      titleRef.current.style.transform = "translateY(10px)";

      setTimeout(() => {
        if (titleRef.current) {
          titleRef.current.style.transition = "all 0.8s ease-out 0.2s";
          titleRef.current.style.opacity = "1";
          titleRef.current.style.transform = "translateY(0)";
        }
      }, 100);
    }

    if (buttonRef.current) {
      buttonRef.current.style.opacity = "0";
      buttonRef.current.style.transform = "translateY(10px)";

      setTimeout(() => {
        if (buttonRef.current) {
          buttonRef.current.style.transition = "all 0.8s ease-out 0.4s";
          buttonRef.current.style.opacity = "1";
          buttonRef.current.style.transform = "translateY(0)";
        }
      }, 100);
    }
  }, []);

  const handleGoogleLogin = () => {
    if (buttonRef.current) {
      buttonRef.current.style.transform = "scale(0.98)";
      setTimeout(() => {
        if (buttonRef.current) {
          buttonRef.current.style.transform = "scale(1)";
        }
        window.location.href =
          "http://localhost:8000/api/v1/auth/oauth/google/login";
      }, 150);
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-background text-foreground overflow-hidden relative flex flex-col justify-center items-center"
    >
      <div ref={cardRef} className="relative z-10 max-w-md w-full mx-4">
        <div className="bg-card backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-8 hover:border-primary/40 transition-all duration-300">
          <h1 ref={titleRef} className="text-4xl font-bold text-center mb-2">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Ozaspen
            </span>
          </h1>

          <p className="text-muted-foreground text-center mb-8 text-sm">
            Sign in to access your workspace and unlock your productivity
          </p>

          <button
            ref={buttonRef}
            onClick={handleGoogleLogin}
            className="w-full group relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-3 relative z-10" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="relative z-10">Continue with Google</span>
          </button>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-xs">
              By signing in, you agree to our{" "}
              <span className="text-primary hover:text-primary/80 cursor-pointer transition-colors">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-primary hover:text-primary/80 cursor-pointer transition-colors">
                Privacy Policy
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
