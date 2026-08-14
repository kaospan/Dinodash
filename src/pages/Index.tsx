import { useEffect, useState } from "react";
import LevelMapper from "@/components/LevelMapper";
import { Dinodash3D } from "@/components/Dinodash3D";
import { PuzzleGame } from "@/components/PuzzleGame";
import { useLocation } from "react-router-dom";

const canUseWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl" as never)
    );
  } catch {
    return false;
  }
};

const Index = () => {
  const location = useLocation();
  const [webglReady, setWebglReady] = useState<boolean | null>(null);
  const showMapper = location.pathname.includes("mapper") || location.search.includes("mapper");
  const showLegacy2D = location.search.includes("2d");

  useEffect(() => {
    // Detect WebGL before mounting react-three-fiber. On devices/browsers where WebGL
    // is unavailable, keep the game usable instead of leaving a black/empty canvas.
    setWebglReady(canUseWebGL());
  }, []);

  return (
    <div className="relative h-[100svh] min-h-[100svh] w-screen overflow-hidden bg-[#d8c9a6]">
      <div className="relative z-10 h-full w-full">
        {showMapper ? (
          <LevelMapper />
        ) : showLegacy2D || webglReady === false ? (
          <PuzzleGame />
        ) : webglReady === null ? (
          <div className="flex h-full items-center justify-center bg-[#d8c9a6] text-[#263327]">
            <div className="rounded-3xl bg-[#f5edcf] px-7 py-6 text-center shadow-xl">
              <div className="text-xs font-black tracking-[.25em] text-[#75633f]">DINODASH</div>
              <div className="mt-2 text-xl font-black">LOADING 3D...</div>
            </div>
          </div>
        ) : (
          <Dinodash3D />
        )}
      </div>
    </div>
  );
};

export default Index;
