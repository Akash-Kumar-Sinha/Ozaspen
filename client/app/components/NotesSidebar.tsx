import { Plus } from "lucide-react";

interface ColorCircleProps {
  onClick: () => void;
  color: keyof typeof colorMap;
}

const colorMap = {
  yellow: "#facc15",
  green: "#4ade80",
  orange: "#fb923c",
  purple: "#a855f7",
  blue: "#3b82f6",
} as const;

const ColorCircle = ({ onClick, color }: ColorCircleProps) => {
  return (
    <div
      role="button"
      className="w-6 h-6 rounded-full transition-transform group-hover:scale-110"
      style={{ backgroundColor: colorMap[color] }}
      onClick={onClick}
    />
  );
};

const NotesSidebar = () => {
  const handleAddNote = (color: keyof typeof colorMap) => {
  };
  return (
    <aside
      className="group/sidebar h-full bg-zinc-900 text-zinc-50 overflow-y-auto relative flex w-32
      flex-col z-[9999] items-center transition-all"
    >
      <div className="mt-4">
        <p className="text-purple-500 font-semibold">OzasPen</p>
      </div>

      <div className="mt-10">
        <button className="bg-zinc-950 p-2 rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition">
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div
        className="p-4 opacity-0 group-hover/sidebar:opacity-100 transition-opacity mt-6 w-full flex items-center"
      >
        <ul className="flex flex-col items-center w-full gap-4">
          <li className="mb-2">
            <ColorCircle onClick={() => {handleAddNote("yellow")}} color="yellow"  />
          </li>
          <li className="mb-2">
            <ColorCircle onClick={() => {handleAddNote("green")}} color="green" />
          </li>
          <li className="mb-2">
            <ColorCircle onClick={() => {handleAddNote("purple")}} color="purple" />
          </li>
          <li className="mb-2">
            <ColorCircle onClick={() => {handleAddNote("blue")}} color="blue" />
          </li>
         
          <li className="mb-2">
            <ColorCircle onClick={() => {handleAddNote("orange")}} color="orange" />
          </li>
         
        </ul>
      </div>

      <div
        className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity cursor-ew-resize 
        absolute h-full w-1 bg-zinc-800 right-0 top-0"
      />
    </aside>
  );
};

export default NotesSidebar;

