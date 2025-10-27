"use client";

import NotesSidebar from "@/components/StickyNotes/NotesSidebar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <NotesSidebar />
      <div className="flex-1 h-full overflow-hidden relative">{children}</div>
    </div>
  );
};

export default MainLayout;
