import LevelMapper from "@/components/LevelMapper";
import { Dinodash3D } from "@/components/Dinodash3D";
import { PuzzleGame } from "@/components/PuzzleGame";
import { useLocation } from "react-router-dom";

const Index = () => {
  const location = useLocation();
  const showMapper = location.pathname.includes("mapper") || location.search.includes("mapper");
  const showLegacy2D = location.search.includes("2d");

  return (
    <div className="relative h-[100svh] min-h-[100svh] w-screen overflow-hidden bg-black">
      <div className="relative z-10 h-full w-full">
        {showMapper ? <LevelMapper /> : showLegacy2D ? <PuzzleGame /> : <Dinodash3D />}
      </div>
    </div>
  );
};

export default Index;
