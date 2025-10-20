"use client";

import { BACKEND_AUTH_DOMAIN } from "@/app/lib/constant";
import AuthLoading from "@/components/Shared/AuthLoading";
import AuthRequired from "@/components/Shared/AuthRequired";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);

        const response = await axios.get(
          `${BACKEND_AUTH_DOMAIN}/auth/session`,
          {
            withCredentials: true,
            timeout: 10000,
          }
        );

        const { data } = response;

        if (data && typeof data.authenticated === "boolean") {
          setIsAuthenticated(data.authenticated);
        } else {
          console.warn("Invalid authentication response:", data);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-screen">
        <AuthLoading />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <AuthRequired />
      </div>
    );
  }

  if (isAuthenticated) {
    return <div className="flex h-screen bg-background">{children}</div>;
  }

  return (
    <div className="h-screen w-screen">
      <AuthLoading />
    </div>
  );
};

export default AuthLayout;
