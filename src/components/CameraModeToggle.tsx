import { useEffect, useState } from "react";
import { Camera, Move3D } from "lucide-react";
import { useLocation } from "react-router-dom";
import { CAMERA_MODE_EVENT } from "@/hooks/useCameraGestures";

export function CameraModeToggle() {
  const location = useLocation();
  const [enabled, setEnabled] = useState(() => {
    try { return localStorage.getItem("dinodash-camera-mode") === "1"; } catch { return false; }
  });

  useEffect(() => {
    const handle = (event: Event) => {
      const value = (event as CustomEvent<{ enabled?: boolean }>).detail?.enabled;
      if (typeof value === "boolean") setEnabled(value);
    };
    window.addEventListener(CAMERA_MODE_EVENT, handle);
    return () => window.removeEventListener(CAMERA_MODE_EVENT, handle);
  }, []);

  if (location.pathname !== "/3d") return null;

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    try { localStorage.setItem("dinodash-camera-mode", next ? "1" : "0"); } catch { /* localStorage may be unavailable */ }
    window.dispatchEvent(new CustomEvent(CAMERA_MODE_EVENT, { detail: { enabled: next } }));
  };

  return (
    <button
      type="button"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Camera mode on" : "Camera mode off"}
      className={`fixed bottom-20 right-4 z-[100] flex min-h-14 items-center gap-2 rounded-2xl border px-4 py-3 font-black shadow-2xl backdrop-blur-md transition-all ${enabled ? "border-amber-200 bg-amber-400 text-black" : "border-white/40 bg-black/80 text-white"}`}
    >
      {enabled ? <Camera className="h-6 w-6" /> : <Move3D className="h-6 w-6" />}
      <span>{enabled ? "CAMERA ON" : "CAMERA OFF"}</span>
    </button>
  );
}
