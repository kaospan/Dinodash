import type { RefObject } from "react";
import { useEffect, useState } from "react";
import { Camera, Move3D } from "lucide-react";
import { CAMERA_MODE_EVENT } from "@/hooks/useCameraGestures";

interface TouchControlsProps {
  onMove: (dx: number, dy: number) => void;
  disabled?: boolean;
  targetRef?: RefObject<HTMLElement | null>;
}

export const TouchControls = ({ onMove, disabled, targetRef }: TouchControlsProps) => {
  const [cameraMode, setCameraMode] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const targetEl = targetRef?.current ?? (document.querySelector("[data-touch-controls-target]") as HTMLElement | null) ?? (document.querySelector("canvas") as HTMLElement | null);
    if (!targetEl) return;

    let touchStart: { x: number; y: number } | null = null;
    const handleTouchStart = (e: TouchEvent) => {
      if (disabled || cameraMode || e.touches.length !== 1) return;
      const touch = e.touches[0];
      touchStart = { x: touch.clientX, y: touch.clientY };
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (disabled || cameraMode || !touchStart || e.changedTouches.length < 1) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const distance = Math.hypot(deltaX, deltaY);
      if (distance >= 30) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) onMove(deltaX > 0 ? 1 : -1, 0);
        else onMove(0, deltaY > 0 ? 1 : -1);
      }
      touchStart = null;
    };
    const handleTouchCancel = () => { touchStart = null; };

    targetEl.addEventListener("touchstart", handleTouchStart, { passive: true });
    targetEl.addEventListener("touchend", handleTouchEnd, { passive: true });
    targetEl.addEventListener("touchcancel", handleTouchCancel, { passive: true });
    return () => {
      targetEl.removeEventListener("touchstart", handleTouchStart);
      targetEl.removeEventListener("touchend", handleTouchEnd);
      targetEl.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [onMove, disabled, targetRef, cameraMode]);

  const toggleCameraMode = () => {
    const enabled = !cameraMode;
    setCameraMode(enabled);
    window.dispatchEvent(new CustomEvent(CAMERA_MODE_EVENT, { detail: { enabled } }));
  };

  return (
    <button
      type="button"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={toggleCameraMode}
      aria-label={cameraMode ? "Camera mode on — swipe rotates camera, pinch zooms" : "Camera mode off — swipe moves Dino, pinch zoom locked"}
      aria-pressed={cameraMode}
      title={cameraMode ? "Camera: ON — swipe rotates, pinch zooms" : "Camera: OFF — swipe moves Dino"}
      className={`fixed bottom-4 right-4 z-[80] flex h-12 w-12 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition-all ${cameraMode ? "border-amber-300/80 bg-amber-500/90 text-black" : "border-white/25 bg-black/65 text-white"}`}
    >
      {cameraMode ? <Camera className="h-5 w-5" /> : <Move3D className="h-5 w-5" />}
    </button>
  );
};
