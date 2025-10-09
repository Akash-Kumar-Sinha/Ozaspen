"use client";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  console.log("AuthLayout rendered");
  return <div className="flex h-screen">{children}</div>;
};

export default AuthLayout;
