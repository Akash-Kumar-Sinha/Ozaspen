"use client";

import { BACKEND_AUTH_DOMAIN } from "@/app/lib/constant";
import AuthLoading from "@/components/Loading/AuthLoading";
import axios from "axios";
import { redirect } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(
          `${BACKEND_AUTH_DOMAIN}/auth/session`,
          {
            withCredentials: true,
          }
        );
        console.log("Authentication status:", data);

        setIsAuthenticated(data.authenticated);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (!isLoading) {
    return (
      <div className="h-screen w-sscreen flex items-center justify-center">
        <AuthLoading />
      </div>
    );
  }

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
  return <div className="flex h-screen bg-black">{children}</div>;
};

export default AuthLayout;
