import { Component, type ErrorInfo, type ReactNode, useEffect, useState } from "react";
import LevelMapper from "@/components/LevelMapper";
import { Dinodash3D } from "@/components/Dinodash3D";
import { PuzzleGame } from "@/components/PuzzleGame";
import { useLocation } from "react-router-dom";

const canUseWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    const attrs = { alpha: true, antialias: true, depth: true, stencil: false };
    const gl =
      canvas.getContext("webgl2", attrs) ??
      canvas.getContext("webgl", attrs) ??
      canvas.getContext("experimental-webgl", attrs as never);
    if (!gl) return false;
    const context = gl as WebGLRenderingContext;
    return !context.isContextLost();
  } catch {
    return false;
  }
};

class ThreeDErrorBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Dinodash 3D runtime failure; falling back to 2D", error, info);
    this.props.onFailure();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const Index = () => {
  const location = useLocation();
  const [webglReady, setWebglReady] = useState<boolean | null>(null);
  const showMapper = location.pathname.includes("mapper") || location.search.includes("mapper");
  const showLegacy2D = location.search.includes("2d");

  useEffect(() => {
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
          <ThreeDErrorBoundary onFailure={() => setWebglReady(false)}>
            <Dinodash3D />
          </ThreeDErrorBoundary>
        )}
      </div>
    </div>
  );
};

export default Index;
