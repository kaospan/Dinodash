import { useRef, useState } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right';
type Props = { onDirection: (direction: Direction) => void };

const DEAD_ZONE = 18;

export function VirtualThumbstick({ onDirection }: Props) {
  const origin = useRef({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const [stick, setStick] = useState({ x: 0, y: 0 });

  const end = () => {
    setActive(false);
    setStick({ x: 0, y: 0 });
  };

  const move = (x: number, y: number) => {
    const dx = x - origin.current.x;
    const dy = y - origin.current.y;
    if (Math.hypot(dx, dy) < DEAD_ZONE) return;
    setStick({ x: Math.max(-32, Math.min(32, dx)), y: Math.max(-32, Math.min(32, dy)) });
    onDirection(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  };

  return <div
    className="relative h-24 w-24 select-none touch-none rounded-full bg-black/20 shadow-inner"
    onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); origin.current = { x: e.clientX, y: e.clientY }; setActive(true); }}
    onPointerMove={e => active && move(e.clientX, e.clientY)}
    onPointerUp={end}
    onPointerCancel={end}
  >
    <div className="absolute inset-2 rounded-full border border-white/20" />
    <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f5edcf]/95 shadow-lg transition-transform" style={{ transform: `translate(calc(-50% + ${stick.x}px), calc(-50% + ${stick.y}px))` }} />
  </div>;
}
