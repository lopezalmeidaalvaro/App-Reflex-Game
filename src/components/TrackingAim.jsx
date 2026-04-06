import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Move, RotateCcw } from 'lucide-react';
import { useGameFeel } from '../hooks/useGameFeel';
import BackButton from './ui/BackButton';

const TARGET_TOTAL = 10;

export default function TrackingAim({ onBack, onSaveRecord }) {
    const [gameState, setGameState] = useState('idle'); // idle, playing, result
    const [targetsHit, setTargetsHit] = useState(0);
    const [stats, setStats] = useState(null); // { totalTime }
    const [targetPositions, setTargetPositions] = useState([]);

    const { triggerSuccess, triggerStart } = useGameFeel();
    const startTime = useRef(0);
    const isProcessing = useRef(false);

    // Limpieza de estados en desmontaje
    useEffect(() => {
        return () => {
            isProcessing.current = false;
        };
    }, []);

    const generatePositions = () => {
        // Generate an array of 5 waypoint coordinates for the target to fly through
        const points = [];
        for (let i = 0; i < 4; i++) {
            // Generates a pure 0 to 1 mathematical ratio.
            points.push({
                x: Math.random(),
                y: Math.random()
            });
        }
        return points;
    };

    const spawnTarget = () => {
        setTargetPositions(generatePositions());
    };

    const startGame = () => {
        if (isProcessing.current) return;
        triggerStart();
        setTargetsHit(0);
        setGameState('playing');
        setStats(null);
        spawnTarget();
        isProcessing.current = false;
        startTime.current = performance.now();
    };

    const hitTarget = (e) => {
        // Anti-Exploit Validation
        if (gameState !== 'playing' || isProcessing.current) return;
        e.stopPropagation();
        e.preventDefault();

        isProcessing.current = true;
        triggerSuccess();

        const hits = targetsHit + 1;
        if (hits >= TARGET_TOTAL) {
            // Game over
            const totalTime = performance.now() - startTime.current;
            setStats({ totalTime });
            setGameState('result');
            
            try {
                if (typeof onSaveRecord === 'function') {
                    onSaveRecord(totalTime);
                }
            } catch (error) {
                console.error("TrackingAim: Failed to save record.", error);
            }
        } else {
            setTargetsHit(hits);
            spawnTarget();
        }
        isProcessing.current = false;
    };

    // We use pure %. We will restrict the range with a physical CSS container (inset) 
    // to avoid calc() interpolation bugs in framer-motion.
    const xPath = targetPositions.map(p => `${p.x * 100}%`);
    const yPath = targetPositions.map(p => `${p.y * 100}%`);

    return (
        <motion.div
            className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#0f172a] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="absolute top-6 left-6 z-50">
                <BackButton onBack={onBack} />
            </div>

            <AnimatePresence mode="wait">
                {gameState === 'idle' && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-slate-800/80 p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-700 text-center max-w-sm w-full mx-4 z-40"
                    >
                        <div className="flex justify-center">
                            <Move size={48} className="text-rose-400 mb-6 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
                        </div>
                        <h1 className="text-4xl font-black mb-4 tracking-tight text-white">Tracking</h1>
                        <p className="text-slate-400 text-base mb-8">
                            Advanced aiming difficulty. Destroy {TARGET_TOTAL} targets in constant erratic motion.
                        </p>
                        <button
                            onPointerDown={(e) => { e.stopPropagation(); startGame(); }}
                            className="bg-rose-500 text-slate-900 px-10 py-4 rounded-xl font-black text-xl uppercase tracking-widest hover:bg-rose-400 active:scale-95 shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all w-full"
                        >
                            Hunt
                        </button>
                    </motion.div>
                )}

                {gameState === 'playing' && (
                    <div key="playing-score" className="absolute top-6 right-6 z-50">
                        <div className="text-3xl font-black italic text-rose-500 tracking-widest drop-shadow-md">
                            {targetsHit} <span className="text-slate-600">/ {TARGET_TOTAL}</span>
                        </div>
                    </div>
                )}

                {gameState === 'result' && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center p-10 bg-slate-800/90 backdrop-blur-md rounded-[2rem] border border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-40 max-w-sm w-full mx-4 text-center"
                    >
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Hunt Complete</h2>
                        <div className="flex items-baseline justify-center mb-2">
                           <div className="text-6xl md:text-7xl font-mono font-black text-rose-400 drop-shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                                {Math.round(stats.totalTime)}
                           </div>
                           <span className="text-3xl font-sans text-slate-500 ml-2">ms</span>
                        </div>
                        <div className="text-slate-400 font-bold mb-10 text-lg">
                            {Math.round(stats.totalTime / TARGET_TOTAL)} ms / target
                        </div>

                        <button
                            onPointerDown={(e) => { e.stopPropagation(); startGame(); }}
                            className="w-full flex items-center justify-center gap-3 bg-rose-500 text-slate-900 px-8 py-4 rounded-xl font-black text-lg uppercase tracking-wide hover:bg-rose-400 active:scale-95 transition-all shadow-[0_0_20px_rgba(244,63,94,0.4)]"
                        >
                            <RotateCcw size={22} /> Play Again
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* The Target Area */}
            {gameState === 'playing' && targetPositions.length > 0 && (
                <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-4 pointer-events-none z-10">
                    <div className="relative w-full max-w-4xl h-[60vh] bg-slate-800/30 rounded-3xl border-4 border-dashed border-slate-700/50 overflow-hidden">
                        {/* Safe Inset Zone: Mathematically prevents the ball (60px) from touching the edges */}
                        <div className="absolute inset-[30px] pointer-events-none">
                            <motion.div
                            key={targetsHit} // Force a re-mount of the animation on each new target
                            layoutId="tracking-target"
                            className="absolute pointer-events-auto"
                            style={{
                                width: '60px', height: '60px',
                                marginLeft: '-30px', marginTop: '-30px', /* Centrar exactamente el pivote animado */
                                borderRadius: '50%'
                            }}
                            initial={{
                                left: xPath[0] || '50%',
                                top: yPath[0] || '50%'
                            }}
                            animate={{
                                left: xPath,
                                top: yPath
                            }}
                            transition={{
                                duration: 3.5, // Faster
                                ease: "linear",
                                repeat: Infinity,
                                repeatType: "mirror"
                            }}
                            onPointerDown={hitTarget}
                        >
                            <div className="w-full h-full bg-rose-500 rounded-full shadow-[0_0_30px_rgba(244,63,94,0.8)] border-4 border-white flex items-center justify-center hover:scale-110 active:scale-90 transition-transform cursor-crosshair group">
                                <div className="w-2 h-2 bg-white rounded-full group-hover:scale-150 transition-transform" />
                            </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
