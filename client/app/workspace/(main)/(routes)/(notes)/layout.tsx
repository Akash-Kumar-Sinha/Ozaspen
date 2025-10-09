"use client";

import NotesSidebar from "@/app/components/NotesSidebar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen">
      <NotesSidebar />
      <div className="flex-1 h-full overflow-y-auto">{children}</div>
    </div>
  );
};

export default MainLayout;
