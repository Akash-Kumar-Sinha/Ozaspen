"use client";

import NotesSidebar from "@/components/NotesSidebar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen">
      <NotesSidebar />
      <div className="flex-1 h-full overflow-visible custom-scrollbar">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
