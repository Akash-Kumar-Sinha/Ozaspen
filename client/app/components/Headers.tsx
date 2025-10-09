import { Sparkles } from "lucide-react";
import Link from "next/link";
import JoinButton from "./JoinButton";

const Headers = () => {
  return (
    <nav className="relative z-50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 ">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center md:gap-20">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center ">
                <Sparkles size={20} className="text-white " />
              </div>
              <span className="hidden md:block text-2xl font-bold tracking-tight">
                Ozaspen
              </span>
            </div>
            <ul className="flex gap-4 md:gap-20 ml-10 text-gray-400">
              <li>Solutions</li>
              <li>Blog</li>
              <li>About</li>
            </ul>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Log in
            </Link>
            <JoinButton label="Join now" onClick={() => {}} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Headers;
