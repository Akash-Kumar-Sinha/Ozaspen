import { useRouter } from "next/navigation";
import JoinButton from "../Button/JoinButton";

const Headers = () => {
  const router = useRouter();

  return (
    <nav className="relative z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Ozaspen
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <JoinButton label="Log in" onClick={() => router.push("/login")} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Headers;
