"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";

interface WorkspaceCardProps {
  title: string;
  description: string;
  routes: string;
}

const WorkspaceCard = ({ title, description, routes }: WorkspaceCardProps) => {
  useGSAP(() => {
    const t1 = gsap.timeline({
      repeat: -1,
      yoyo: true,
      defaults: { duration: 2, ease: "power1.inOut" },
    });

    t1.to(".colorEffect", {
      borderColor: "purple",
    })
      .to(".colorEffect", {
        borderColor: "#8b5cf6",
      })
      .to(".colorEffect", {
        borderColor: "#ec4899",
      })
      .to(".colorEffect", {
        borderColor: "#8b5cf6",
      })
      .to(".colorEffect", {
        borderColor: "#a78bfa",
      })
      .to(".colorEffect", {
        borderColor: "red",
      });
  }, []);

  return (
    <div className="colorEffect border p-8 m-2 rounded-xl shadow-lg w-64 border-purple-500 bg-black/60 backdrop-blur-sm hover:bg-black/80 transition-all duration-300 transform hover:scale-105">
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
        <p className="text-sm text-gray-400 text-center mb-4">{description}</p>
        <Link
          href={routes}
          className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 transform hover:scale-105"
        >
          Go to {title}
        </Link>
      </div>
    </div>
  );
};

export default WorkspaceCard;
