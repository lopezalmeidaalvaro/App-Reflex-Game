import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RotateCcw } from 'lucide-react';
import { useGameFeel } from '../hooks/useGameFeel';
import BackButton from './ui/BackButton';

export default function ReactionGame({ onBack, onSaveRecord }) {
    const [gameState, setGameState] = useState('idle');
    const [reactionTime, setReactionTime] = useState(null);
    const { triggerSuccess, triggerFail, triggerStart } = useGameFeel();

    const startTime = useRef(0);
    const timeoutId = useRef(null);

    useEffect(() => {
        return () => {
            if (timeoutId.current) clearTimeout(timeoutId.current);
        };
    }, []);

    const startGame = () => {
        setGameState('waiting');
        setReactionTime(null);

        const delay = Math.random() * 3000 + 2000;

        if (timeoutId.current) clearTimeout(timeoutId.current);

        timeoutId.current = setTimeout(() => {
            setGameState('stimulus');
            startTime.current = performance.now();
        }, delay);
    };

    const handleClick = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (gameState === 'idle') {
            triggerStart();
            startGame();
        } else if (gameState === 'waiting') {
            triggerFail();
            if (timeoutId.current) clearTimeout(timeoutId.current);
            setGameState('early');
        } else if (gameState === 'stimulus') {
            triggerSuccess();
            const time = performance.now() - startTime.current;
            setReactionTime(time);
            setGameState('result');
            onSaveRecord(time);
        }
    };

    let bgColor = "bg-slate-900";
    if (gameState === 'waiting') bgColor = "bg-red-500";
    if (gameState === 'stimulus') bgColor = "bg-emerald-500";
    if (gameState === 'early' || gameState === 'result') bgColor = "bg-slate-900";

    return (
        <motion.div
            className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 ${bgColor}`}
            onPointerDown={handleClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, backgroundColor: bgColor }}
            exit={{ opacity: 0 }}
        >
            <BackButton onBack={onBack} />

            <AnimatePresence mode="wait">
                {gameState === 'idle' && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center justify-center p-8 bg-slate-800/80 rounded-[2rem] border border-slate-700 shadow-2xl"
                    >
                        <Zap size={48} className="text-emerald-400 mb-6 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                        <h1 className="text-4xl font-black mb-4 tracking-tight text-white">Visual Reaction</h1>
                        <p className="text-slate-400 text-lg mb-8 text-center max-w-sm">
                            When the screen turns green, click as fast as you can.
                        </p>
                        <div className="text-lg font-bold text-slate-300 bg-slate-900 px-8 py-4 rounded-xl shadow-inner uppercase tracking-widest pointer-events-none">
                            Click the screen to start
                        </div>
                    </motion.div>
                )}

                {gameState === 'waiting' && (
                    <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-6xl md:text-8xl font-black text-white/90 uppercase tracking-widest pointer-events-none">
                        Wait...
                    </motion.div>
                )}

                {gameState === 'stimulus' && (
                    <motion.div key="stimulus" initial={{ scale: 1.2 }} animate={{ scale: 1 }} exit={{ opacity: 0 }} className="text-6xl md:text-8xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] pointer-events-none">
                        NOW!
                    </motion.div>
                )}

                {gameState === 'early' && (
                    <motion.div key="early" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center text-center p-8 bg-slate-800/80 rounded-[2rem] border border-slate-700 shadow-2xl relative z-40" onPointerDown={(e) => e.stopPropagation()}>
                        <div className="text-4xl font-black text-red-500 mb-2 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">Too early</div>
                        <p className="text-slate-400 font-medium mb-8">You clicked too soon.</p>
                        <button onPointerDown={(e) => { e.stopPropagation(); startGame(); }} className="flex items-center gap-2 bg-slate-900 px-6 py-4 rounded-xl text-white font-bold uppercase tracking-widest hover:bg-slate-700 active:scale-95 transition-all shadow-md">
                            <RotateCcw size={20} /> Play Again
                        </button>
                    </motion.div>
                )}

                {gameState === 'result' && (
                    <motion.div key="result" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="flex flex-col items-center justify-center text-center p-12 bg-slate-800/80 rounded-[2rem] border border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-40" onPointerDown={(e) => e.stopPropagation()}>
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Reaction Time</h2>
                        <div className="text-7xl md:text-8xl font-mono font-black text-emerald-400 mb-10 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                            {Math.round(reactionTime)}<span className="text-3xl font-sans text-slate-500 ml-2">ms</span>
                        </div>

                        <button onPointerDown={(e) => { e.stopPropagation(); startGame(); }} className="w-full flex items-center justify-center gap-3 bg-emerald-500 text-slate-900 px-8 py-4 rounded-xl font-black text-lg uppercase tracking-wide hover:bg-emerald-400 active:scale-95 transition-all shadow-[0_0_20px_rgba(52,211,153,0.4)]">
                            <RotateCcw size={22} /> Play Again
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
