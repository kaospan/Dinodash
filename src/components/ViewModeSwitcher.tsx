import type { ViewMode } from "@/components/PuzzleGame";

interface ViewModeSwitcherProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  disabledModes?: Set<ViewMode>;
  compact?: boolean;
}

/**
 * View-mode switching is intentionally hidden from the gameplay HUD.
 * The component remains as a compatibility shim so existing imports/call sites
 * do not affect the gameplay architecture.
 */
export const ViewModeSwitcher = (_props: ViewModeSwitcherProps) => null;
