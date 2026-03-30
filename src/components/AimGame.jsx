import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, RotateCcw } from 'lucide-react';
import { useGameFeel } from '../hooks/useGameFeel';
import BackButton from './ui/BackButton';

const TARGET_TOTAL = 10;

export default function AimGame({ onBack, onSaveRecord }) {
    const [gameState, setGameState] = useState('idle'); // idle, playing, result
    const [targetsHit, setTargetsHit] = useState(0);
    const [stats, setStats] = useState(null); // { totalTime, avgTime }
    const [targetPos, setTargetPos] = useState({ x: 50, y: 50 }); // percentages

    const { triggerSuccess, triggerStart } = useGameFeel();

    const startTime = useRef(0);

    const startGame = () => {
        triggerStart();
        setTargetsHit(0);
        setGameState('playing');
        setStats(null);
        randomizePosition();
        startTime.current = performance.now();
    };

    const randomizePosition = () => {
        // Limits between 5% and 90% (avoids hitting edges)
        const x = Math.random() * 85 + 5;
        const y = Math.random() * 85 + 5;
        setTargetPos({ x, y });
    };

    const hitTarget = (e) => {
        if (gameState !== 'playing') return;
        e.stopPropagation();
        e.preventDefault();
        triggerSuccess();

        const hits = targetsHit + 1;
        if (hits >= TARGET_TOTAL) {
            const totalTime = performance.now() - startTime.current;
            const averageTime = totalTime / TARGET_TOTAL;

            setStats({ totalTime, averageTime });
            setGameState('result');
            onSaveRecord(totalTime);
        } else {
            setTargetsHit(hits);
            randomizePosition();
        }
    };

    return (
        <motion.div
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center transition-colors duration-100 touch-none select-none bg-slate-900 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="absolute top-4 left-4 z-50 flex items-center justify-between w-[calc(100%-2rem)]">
                <BackButton onBack={onBack} />

                {gameState === 'playing' && (
                    <div className="ml-auto pointer-events-auto bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700 font-black tracking-widest text-cyan-400">
                        OBJETIVOS: <span className="text-white ml-2">{targetsHit}/{TARGET_TOTAL}</span>
                    </div>
                )}
            </div>

            <AnimatePresence mode="wait">
                {gameState === 'idle' && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center justify-center p-8 bg-slate-800/80 rounded-[2rem] border border-slate-700 shadow-2xl z-40 max-w-sm"
                    >
                        <Crosshair size={48} className="text-cyan-400 mb-6 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                        <h1 className="text-4xl font-black mb-4 tracking-tight text-white">Precision Aim</h1>
                        <p className="text-slate-400 text-base mb-8 text-center max-w-xs">
                            Haz clic en todos los objetivos de la pantalla lo más rápido que puedas.
                        </p>
                        <button
                            onPointerDown={(e) => { e.stopPropagation(); startGame(); }}
                            className="bg-cyan-500 text-slate-900 px-10 py-4 rounded-xl font-black text-xl uppercase tracking-widest hover:bg-cyan-400 active:scale-95 shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all w-full"
                        >
                            Comenzar
                        </button>
                    </motion.div>
                )}

                {gameState === 'result' && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center p-10 bg-slate-800/90 backdrop-blur-md rounded-[2rem] border border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-40 max-w-sm"
                    >
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Misión Completada</h2>
                        <div className="text-6xl md:text-7xl font-mono font-black text-cyan-400 mb-2 drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                            {Math.round(stats.totalTime)}<span className="text-3xl font-sans text-slate-500 ml-2">ms</span>
                        </div>
                        <div className="text-slate-400 font-bold mb-10 text-lg">
                            {Math.round(stats.averageTime)} ms / objetivo
                        </div>

                        <button
                            onPointerDown={(e) => { e.stopPropagation(); startGame(); }}
                            className="w-full flex items-center justify-center gap-3 bg-cyan-500 text-slate-900 px-8 py-4 rounded-xl font-black text-lg uppercase tracking-wide hover:bg-cyan-400 active:scale-95 transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                        >
                            <RotateCcw size={22} /> Repetir
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Safe Play Area Container for Aiming */}
            {gameState === 'playing' && (
                <div className="w-full flex-1 flex items-center justify-center p-4 max-h-[1000px] mt-16 pointer-events-none">
                    <div className="relative w-full max-w-4xl h-[65vh] min-h-[400px] bg-slate-800/40 border-2 border-slate-700/50 rounded-3xl shadow-inner pointer-events-auto overflow-hidden">
                        <motion.div
                            key={`${targetsHit}`} // forces reanimation snap
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            onPointerDown={hitTarget}
                            className="absolute w-[60px] h-[60px] rounded-full shadow-[0_0_20px_rgba(34,211,238,0.6)] border border-cyan-300 bg-cyan-400 hover:scale-110 active:scale-90 active:bg-cyan-300 cursor-crosshair group flex items-center justify-center"
                            style={{
                                left: `${targetPos.x}%`,
                                top: `${targetPos.y}%`,
                                marginLeft: '-30px',
                                marginTop: '-30px'
                            }}
                        >
                            <div className="w-2 h-2 bg-white rounded-full group-hover:scale-150 transition-transform" />
                        </motion.div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
