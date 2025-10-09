import WorkspaceCard from "./WorkspaceCard";

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
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center ">
      <div className="w-full md:w-6xl lg:w-6xl p-4 flex flex-wrap justify-center items-center">
        {workspaceFeatures.map((feature, index) => (
          <WorkspaceCard
            key={index}
            { ...feature }
          />
        ))}
      </div>
    </div>
  );
};

export default Workspace;
