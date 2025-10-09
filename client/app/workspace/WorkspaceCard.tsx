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
    <div className="colorEffect border p-8 m-2 rounded-xl shadow-md w-64 border-purple-500">
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-gray-400 text-center">{description}</p>
        <Link href={routes} className="mt-4 text-blue-500 hover:underline">
          Go to {title}
        </Link>
      </div>
    </div>
  );
};

export default WorkspaceCard;
