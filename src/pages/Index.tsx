import { PuzzleGame } from "@/components/PuzzleGame";
import LevelMapper from "@/components/LevelMapper";
import { MapperAuthGate } from "@/components/MapperAuthGate";
import { Dinodash3D } from "@/components/Dinodash3D";
import bgImage from "@/assets/stone-age-bg.png";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

console.log('📄 Index.tsx loading...');

const Index = () => {
    const location = useLocation();
    const isMobile = useIsMobile();
    const showMapper = location.pathname.includes("mapper") || location.search.includes("mapper");
    const showLegacy2D = location.search.includes("2d");

    return (
        <div
            className="relative h-[100svh] min-h-[100svh] w-screen overflow-hidden"
            style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: isMobile ? 'scroll' : 'fixed',
            }}
        >
            <div className="absolute inset-0 opacity-40 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 40%), radial-gradient(circle at 80% 30%, rgba(255,220,170,0.08), transparent 45%), linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.35) 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }} />
            <div className="absolute inset-0 bg-blue-900/40 scanline" />
            <div className="relative z-10 h-full w-full">
                {showMapper ? (
                    <MapperAuthGate><LevelMapper /></MapperAuthGate>
                ) : showLegacy2D ? (
                    <PuzzleGame />
                ) : (
                    <Dinodash3D />
                )}
            </div>
        </div>
    );
};

export default Index;
