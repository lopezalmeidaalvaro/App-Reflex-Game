import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, RotateCcw } from 'lucide-react';
import { useGameFeel } from '../hooks/useGameFeel';
import BackButton from './ui/BackButton';

const GRID_SIZE = 9;

export default function ChimpTest({ onBack, onSaveRecord }) {
    const [gameState, setGameState] = useState('idle'); // idle, mem, playing, error, result
    const [grid, setGrid] = useState([]);
    const [expectedValue, setExpectedValue] = useState(1);
    const [totalTime, setTotalTime] = useState(null);

    const { triggerSuccess, triggerFail, triggerStart } = useGameFeel();
    const startTime = useRef(0);

    const startGame = () => {
        triggerStart();

        // Generate array [1..GRID_SIZE] and shuffle
        const arr = Array.from({ length: GRID_SIZE }, (_, i) => i + 1);
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }

        setGrid(arr.map(val => ({ val, active: true })));
        setExpectedValue(1);
        setGameState('mem'); // Memorization phase
        setTotalTime(null);
        startTime.current = performance.now();
    };

    const handleTap = (num) => {
        if (!num.active || (gameState !== 'mem' && gameState !== 'playing')) return;

        if (num.val === expectedValue) {
            triggerSuccess();

            // If clicking 1, hide all numbers
            if (num.val === 1 && gameState === 'mem') {
                setGameState('playing');
            }

            setGrid(prev => prev.map(n => n.val === num.val ? { ...n, active: false } : n));
            const nextTarget = expectedValue + 1;

            if (nextTarget > GRID_SIZE) {
                const time = performance.now() - startTime.current;
                setTotalTime(time);
                setGameState('result');
                onSaveRecord(time);
            } else {
                setExpectedValue(nextTarget);
            }
        } else {
            triggerFail();
            setGameState('error');
            setTimeout(() => {
                startGame(); // Automatic restart
            }, 800);
        }
    };

    let containerClass = "bg-slate-900";
    if (gameState === 'error') containerClass = "bg-red-500 shadow-[inset_0_0_100px_rgba(239,68,68,0.7)]";

    return (
        <motion.div
            className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center transition-colors duration-150 touch-none select-none ${containerClass}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, backgroundColor: gameState === 'error' ? '#ef4444' : '#0f172a' }}
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
                        className="flex flex-col items-center justify-center p-8 bg-slate-800/80 rounded-[2rem] border border-slate-700 shadow-2xl z-40 mx-4"
                    >
                        <Brain size={48} className="text-orange-400 mb-6 drop-shadow-[0_0_10px_rgba(251,146,60,0.8)]" />
                        <h1 className="text-4xl font-black mb-4 tracking-tight text-white text-center">Chimp Test</h1>
                        <p className="text-slate-400 text-base mb-8 text-center max-w-sm">
                            Memorize the numbers. When you press "1", the rest will hide. Press the remaining blocks in sequential order.
                        </p>
                        <button
                            onPointerDown={(e) => { e.stopPropagation(); startGame(); }}
                            className="bg-orange-500 text-slate-900 px-10 py-4 rounded-xl font-black text-xl uppercase tracking-widest hover:bg-orange-400 active:scale-95 shadow-[0_0_20px_rgba(251,146,60,0.4)] transition-all w-full"
                        >
                            Start
                        </button>
                    </motion.div>
                )}

                {(gameState === 'mem' || gameState === 'playing' || gameState === 'error') && (
                    <motion.div
                        key="playing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center w-full px-4"
                    >
                        <div className="text-slate-500 font-bold tracking-[0.2em] mb-8 text-xl min-h-[4rem]">
                            {gameState === 'mem' ? (
                                <span className="text-orange-400 drop-shadow-[0_0_10px_currentColor]">Press 1 to start</span>
                            ) : (
                                <>NEXT: <span className={`text-4xl block text-center mt-2 ${gameState === 'error' ? 'text-white' : 'text-orange-400'} drop-shadow-[0_0_15px_currentColor]`}>{expectedValue}</span></>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-3 md:gap-4 w-full max-w-[400px] aspect-square">
                            {grid.map((num) => (
                                <div key={num.val} className="w-full h-full relative">
                                    {num.active ? (
                                        <motion.button
                                            layoutId={`chimp-${num.val}`}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{
                                                scale: 1,
                                                opacity: 1,
                                                x: gameState === 'error' ? [-10, 10, -10, 10, 0] : 0
                                            }}
                                            transition={{ duration: gameState === 'error' ? 0.3 : 0.2 }}
                                            whileTap={{ scale: 0.9 }}
                                            onPointerDown={(e) => { e.preventDefault(); handleTap(num); }}
                                            className={`absolute inset-0 w-full h-full border-2 rounded-[1.5rem] flex items-center justify-center text-4xl font-black shadow-xl touch-none select-none
                        ${gameState === 'error'
                                                    ? 'border-white text-white bg-red-400/20'
                                                    : 'border-slate-600 hover:border-slate-500 bg-slate-800 shadow-[0_4px_15px_rgba(0,0,0,0.5)]'
                                                }
                        ${gameState === 'playing' ? 'text-transparent' : 'text-white'}
                      `}
                                        >
                                            {num.val}
                                        </motion.button>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {gameState === 'result' && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center p-10 bg-slate-800/80 rounded-[2rem] border border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-40 max-w-sm w-full mx-4 text-center"
                    >
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Memory Test</h2>
                        <div className="text-6xl md:text-7xl font-mono font-black text-orange-400 mb-10 drop-shadow-[0_0_20px_rgba(251,146,60,0.3)]">
                            {Math.round(totalTime)}<span className="text-3xl font-sans text-slate-500 ml-2">ms</span>
                        </div>

                        <button
                            onPointerDown={(e) => { e.stopPropagation(); startGame(); }}
                            className="w-full flex items-center justify-center gap-3 bg-orange-500 text-slate-900 px-8 py-4 rounded-xl font-black text-lg uppercase tracking-wide hover:bg-orange-400 active:scale-95 transition-all shadow-[0_0_20px_rgba(251,146,60,0.4)]"
                        >
                            <RotateCcw size={22} /> Play Again
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
