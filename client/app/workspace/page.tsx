"use client";

import { redirect } from "next/navigation";
import WorkspaceCard from "../../components/WorkspaceCard";
import axios from "axios";
import { BACKEND_AUTH_DOMAIN } from "../lib/constant";
import { useEffect, useState } from "react";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axios.get(`${BACKEND_AUTH_DOMAIN}/auth/session`, {
          withCredentials: true,
        });
        console.log("Authentication status:", data);

        setIsAuthenticated(data.authenticated);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      }
    };
    if (!isAuthenticated) {
      checkAuth();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Please Log In</h1>
          <button
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
            onClick={() => redirect("/login")}
          >
            Go to the Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black">
        <div className="w-full md:w-6xl lg:w-6xl p-4 flex flex-wrap justify-center items-center">
          {workspaceFeatures.map((feature, index) => (
            <WorkspaceCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </>
  );
};

export default Workspace;
