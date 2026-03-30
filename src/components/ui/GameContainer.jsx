import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';

export default function GameContainer({ gameConfig, onExit, onGameEnd, currentHighScore }) {
    const [gameState, setGameState] = useState('IDLE'); // IDLE, PLAYING, RESULT
    const [lastScore, setLastScore] = useState(null);
    const [isFail, setIsFail] = useState(false);
    const GameComponent = gameConfig.component;

    const startGame = () => {
        setGameState('PLAYING');
        setLastScore(null);
        setIsFail(false);
    };

    const handleFinish = (score, failed = false) => {
        setLastScore(score);
        setIsFail(failed);
        setGameState('RESULT');
        // Important: Do not log null as a high score when failed
        onGameEnd(score, failed);
    };

    return (
        <div className="w-full h-full flex flex-col absolute inset-0 text-white select-none">
            {/* Top Nav (visible always) */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-[100] pointer-events-none">
                <button
                    onClick={onExit}
                    className="bg-dark-surface p-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg border border-slate-700 pointer-events-auto"
                >
                    <ArrowLeft size={24} className="text-slate-300 hover:text-white" />
                </button>
                <div className="text-slate-500 font-bold tracking-[0.2em] uppercase text-sm bg-dark-bg/80 px-4 py-2 rounded-full border border-dark-surface backdrop-blur-sm">
                    {gameConfig.title}
                </div>
            </div>

            <div className="flex-1 w-full relative flex items-center justify-center pt-20">
                <AnimatePresence mode="wait">

                    {gameState === 'IDLE' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                            className="text-center flex flex-col items-center z-10 p-6"
                        >
                            <div className={`mb-6 p-4 rounded-2xl bg-dark-surface border border-slate-800 shadow-xl inline-block ${gameConfig.color}`}>
                                {gameConfig.icon}
                            </div>
                            <h2 className={`text-4xl md:text-5xl font-black mb-4 tracking-tight ${gameConfig.color} drop-shadow-[0_0_15px_currentColor]`}>
                                {gameConfig.title}
                            </h2>
                            <p className="text-slate-400 max-w-sm mb-12 text-lg leading-relaxed">
                                {gameConfig.description}
                            </p>

                            <button
                                onClick={startGame}
                                className={`px-12 py-5 rounded-2xl font-black text-xl tracking-widest uppercase text-dark-bg shadow-[0_0_30px_currentColor] hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-white/20 ${gameConfig.bgColor}`}
                            >
                                Go
                            </button>
                        </motion.div>
                    )}

                    {gameState === 'PLAYING' && (
                        <motion.div
                            key="playing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="absolute inset-0 w-full h-full"
                        >
                            <GameComponent onFinish={handleFinish} theme={gameConfig} />
                        </motion.div>
                    )}

                    {gameState === 'RESULT' && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="bg-dark-surface p-10 md:p-12 rounded-[2rem] text-center border-2 border-slate-800 shadow-2xl z-20 mx-4 w-full max-w-sm relative"
                        >

                            <h3 className="text-sm uppercase tracking-widest font-black text-slate-500 mb-6">Mission Report</h3>

                            {isFail ? (
                                <div className="text-5xl md:text-6xl font-black text-neon-red mb-8 tracking-wider animate-pulse drop-shadow-[0_0_15px_var(--color-neon-red)]">
                                    FAILED
                                </div>
                            ) : (
                                <div className={`text-6xl font-mono font-black ${gameConfig.color} mb-8 tracking-tighter drop-shadow-[0_0_15px_currentColor]`}>
                                    {Math.round(lastScore)}<span className="text-2xl font-sans text-slate-500 ml-1">ms</span>
                                </div>
                            )}

                            <button
                                onClick={startGame}
                                className={`flex items-center justify-center gap-3 w-full py-4 rounded-xl font-black text-lg text-dark-bg hover:brightness-110 active:scale-95 transition-all uppercase tracking-wide shadow-lg ${gameConfig.bgColor}`}
                            >
                                <RotateCcw size={22} strokeWidth={2.5} /> Retry
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* High Score Footer */}
            {gameState === 'IDLE' && currentHighScore && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
                >
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Personal Best</span>
                        <span className="font-mono text-2xl font-bold tracking-wider text-slate-300">
                            {Math.round(currentHighScore)} ms
                        </span>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
