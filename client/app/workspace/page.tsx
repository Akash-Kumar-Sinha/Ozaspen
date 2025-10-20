"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import WorkspaceCard from "../../components/WorkspaceCard";

const workspaceFeatures = [
  {
    title: "Notes",
    description: "Create and manage your notes efficiently.",
    routes: "/workspace/notes",
  },
  {
    title: "Blogs",
    description: "Write and publish your blogs seamlessly.",
    routes: "/workspace/blogs",
  },
  {
    title: "Docs",
    description: "Collaborate on documents in real-time.",
    routes: "/workspace/docs",
  },
  {
    title: "Sticky Notes",
    description: "Keep your important notes always visible.",
    routes: "/workspace/sticky-notes",
  },
  {
    title: "Canvas",
    description: "Visualize your ideas with our interactive canvas.",
    routes: "/workspace/canvas",
  },
  {
    title: "Flowcharts",
    description: "Design and share flowcharts easily.",
    routes: "/workspace/flowcharts",
  },
];

const Workspace = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    gsap.set([titleRef.current, subtitleRef.current], {
      opacity: 0,
      y: 30,
    });

    tl.to(titleRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
    }).to(
      subtitleRef.current,
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
      },
      "-=0.4"
    );
  }, []);

  return (
    <div className="min-h-screen w-full bg-black flex flex-col">
      <div className="flex-shrink-0 pt-12 pb-8 px-8 text-center">
        <h1
          ref={titleRef}
          className="text-4xl md:text-5xl font-light text-white mb-4 tracking-tight"
        >
          Your Workspace
        </h1>
        <p
          ref={subtitleRef}
          className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed"
        >
          Choose from our collection of productivity tools designed to
          streamline your workflow
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div
          ref={containerRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl w-full"
        >
          {workspaceFeatures.map((feature, index) => (
            <WorkspaceCard key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
    </div>
  );
};

export default Workspace;
