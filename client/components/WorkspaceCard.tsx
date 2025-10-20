"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { useRef } from "react";

interface WorkspaceCardProps {
  title: string;
  description: string;
  routes: string;
  index: number;
}

const WorkspaceCard = ({
  title,
  description,
  routes,
  index,
}: WorkspaceCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const card = cardRef.current;
    const content = contentRef.current;

    if (!card || !content) return;

    gsap.set(card, {
      opacity: 0,
      y: 50,
      rotationX: -15,
    });

    gsap.to(card, {
      opacity: 1,
      y: 0,
      rotationX: 0,
      duration: 0.8,
      delay: index * 0.15,
      ease: "back.out(1.7)",
    });

    const handleMouseEnter = () => {
      gsap.to(card, {
        y: -12,
        rotationY: 8,
        rotationX: 2,
        duration: 0.4,
        ease: "power2.out",
      });

      gsap.to(content, {
        y: -6,
        duration: 0.4,
        ease: "power2.out",
      });

      gsap.to(card, {
        y: "-=3",
        duration: 1.5,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
      });
    };

    const handleMouseLeave = () => {
      gsap.killTweensOf(card);

      gsap.to(card, {
        y: 0,
        rotationY: 0,
        rotationX: 0,
        duration: 0.4,
        ease: "power2.out",
      });

      gsap.to(content, {
        y: 0,
        duration: 0.4,
        ease: "power2.out",
      });
    };

    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="relative group cursor-pointer"
      style={{ perspective: "1000px" }}
    >
        <div className="relative p-6 m-3 rounded-2xl bg-black border border-purple-600/20 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-purple-600/60 hover:shadow-2xl hover:shadow-purple-600/20">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-500" />

          <div
            ref={contentRef}
            className="relative z-10 flex flex-col items-center text-center space-y-5"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/20 to-purple-600/40 border border-purple-600/30 flex items-center justify-center group-hover:from-purple-600/40 group-hover:to-purple-600/60 group-hover:border-purple-600/50 transition-all duration-300">
                <div className="w-8 h-8 border-2 border-purple-400/60 rounded-lg rotate-45 group-hover:rotate-90 transition-transform duration-500" />
              </div>
              <div className="absolute inset-0 bg-purple-600/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
            </div>

            <h3 className="text-xl font-semibold text-white group-hover:text-purple-100 transition-colors duration-300">
              {title}
            </h3>

            <p className="text-sm text-gray-300 leading-relaxed group-hover:text-purple-100/80 transition-colors duration-300">
              {description}
            </p>

            <Link
              href={routes}
              className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-purple-600/80 rounded-xl border border-purple-500 hover:bg-purple-600 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-300 transform group-hover:scale-105"
            >
              Enter {title}
              <svg
                className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
    </div>
  );
};

export default WorkspaceCard;
