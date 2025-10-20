import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { User, Loader2 } from "lucide-react";

const AuthLoading = () => {
  const userIconRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.to(userIconRef.current, {
      scale: 1.1,
      duration: 1.5,
      ease: "power2.inOut",
      repeat: -1,
      yoyo: true,
    });

    gsap.to(loaderRef.current, {
      rotation: 360,
      duration: 2,
      ease: "none",
      repeat: -1,
    });

    gsap.fromTo(
      textRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.3 }
    );

    const dots = dotsRef.current?.children;
    if (dots) {
      gsap.to(dots, {
        opacity: 1,
        duration: 0.4,
        stagger: 0.2,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      });
    }
  }, []);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-background/50">
      <div className="relative flex flex-col items-center">
        <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
          <div
            ref={userIconRef}
            className="absolute inset-0 flex items-center justify-center"
          >
            <User className="w-12 h-12 text-muted-foreground" />
          </div>

          <div
            ref={loaderRef}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Loader2 className="w-16 h-16 text-primary/30" strokeWidth={1} />
          </div>
        </div>

        <div ref={textRef} className="text-center mb-4">
          <h3 className="text-lg font-medium text-foreground mb-2">
            Authenticating
          </h3>
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <span>Verifying your session</span>
            <div ref={dotsRef} className="flex gap-1">
              <span className="opacity-0">.</span>
              <span className="opacity-0">.</span>
              <span className="opacity-0">.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLoading;
