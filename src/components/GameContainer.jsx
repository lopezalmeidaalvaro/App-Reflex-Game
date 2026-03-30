import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { saveHighScore } from '../utils/stats';

const colorMap = {
    reaction: { text: 'text-neon-red', bg: 'bg-neon-red', lightBg: 'bg-neon-red/10', glow: 'shadow-[0_0_30px_rgba(255,7,58,0.4)]' },
    aim: { text: 'text-neon-blue', bg: 'bg-neon-blue', lightBg: 'bg-neon-blue/10', glow: 'shadow-[0_0_30px_rgba(0,255,255,0.4)]' },
    sequence: { text: 'text-neon-green', bg: 'bg-neon-green', lightBg: 'bg-neon-green/10', glow: 'shadow-[0_0_30px_rgba(57,255,20,0.4)]' }
};

const GameContainer = ({ gameConfig, onExit, children }) => {
    const [gameState, setGameState] = useState('IDLE'); // IDLE, COOLDOWN, PLAYING, RESULT
    const [score, setScore] = useState(null);
    const [isNewHigh, setIsNewHigh] = useState(false);

    const startGame = useCallback(() => {
        setGameState('COOLDOWN');
        setTimeout(() => {
            setGameState('PLAYING');
        }, 1000); // 1s cooldown to prevent early accidental clicks
    }, []);

    const finishGame = useCallback((finalScore) => {
        // Check if valid score (some games return false if failed)
        if (finalScore === false || finalScore === null) {
            setGameState('RESULT'); // Just failed state without score mapping? Need to handle "Fail".
            setScore('FAIL');
            setIsNewHigh(false);
            return;
        }

        setScore(Math.round(finalScore)); // Save as ms integer
        const newRecord = saveHighScore(gameConfig.id, Math.round(finalScore));
        setIsNewHigh(newRecord);
        setGameState('RESULT');
    }, [gameConfig.id]);

    const colors = colorMap[gameConfig.id];

    return (
        <div className="w-full h-full flex flex-col relative bg-dark">
            {/* Top Navigation */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50 pointer-events-none">
                <button
                    onClick={onExit}
                    className="pointer-events-auto bg-dark-surface p-4 rounded-2xl hover:bg-slate-800 transition-colors shadow-[0_4px_15px_rgba(0,0,0,0.4)] text-slate-300 hover:text-white group"
                >
                    <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <span className="font-bold text-lg uppercase tracking-[0.2em] text-slate-500 hidden md:block">
                    {gameConfig.title}
                </span>
                <div className="w-14" /> {/* Spacer */}
            </div>

            {/* Main Area */}
            <div className="flex-grow w-full h-full relative overflow-hidden flex items-center justify-center">
                <AnimatePresence mode="wait">

                    {gameState === 'IDLE' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                            transition={{ duration: 0.3 }}
                            className="text-center flex flex-col items-center z-10 w-full px-6"
                        >
                            <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight text-white">{gameConfig.title}</h2>
                            <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-md leading-relaxed">
                                {gameConfig.description}
                            </p>

                            <button
                                onClick={startGame}
                                className={`px-16 py-6 rounded-2xl font-black text-2xl tracking-widest uppercase ${colors.bg} text-dark hover:scale-105 active:scale-95 transition-all ${colors.glow}`}
                            >
                                Start Mission
                            </button>
                        </motion.div>
                    )}

                    {gameState === 'COOLDOWN' && (
                        <motion.div
                            key="cooldown"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.5 }}
                            className="text-3xl font-black tracking-widest uppercase text-slate-600 animate-pulse"
                        >
                            Get Ready
                        </motion.div>
                    )}

                    {gameState === 'PLAYING' && (
                        <motion.div
                            key="playing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full absolute inset-0"
                        >
                            {/* Pass the dynamic tailwind color mappings along with onFinish to games */}
                            {React.cloneElement(children, { onFinish: finishGame, theme: colors })}
                        </motion.div>
                    )}

                    {gameState === 'RESULT' && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 150, damping: 20 }}
                            className="bg-dark-surface p-10 md:p-14 rounded-[2rem] text-center max-w-lg w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-800/50 mx-4"
                        >
                            <h3 className="text-xl uppercase tracking-widest font-bold text-slate-500 mb-6">Result Status</h3>

                            {score === 'FAIL' ? (
                                <div className="text-6xl font-black text-red-500 mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] tracking-widest">
                                    FAILED
                                </div>
                            ) : (
                                <div className={`text-6xl md:text-8xl font-mono font-black ${colors.text} mb-4 drop-shadow-[0_0_15px_currentColor] tracking-tighter`}>
                                    {score}<span className="text-3xl font-sans text-slate-500 tracking-normal ml-2">ms</span>
                                </div>
                            )}

                            <div className="h-10 mb-10 mt-2 flex justify-center items-center">
                                {isNewHigh && (
                                    <motion.div
                                        initial={{ scale: 0, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                        transition={{ type: "spring", bounce: 0.6 }}
                                        className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-400 px-6 py-2 rounded-full text-sm font-black tracking-widest uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                                    >
                                        <span>🏆</span> New Record
                                    </motion.div>
                                )}
                                {score === 'FAIL' && (
                                    <span className="text-slate-400 text-sm font-medium tracking-wide">You clicked too early or missed entirely.</span>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                                <button
                                    onClick={startGame}
                                    className={`flex items-center justify-center gap-3 ${colors.bg} text-dark flex-1 py-5 rounded-2xl font-black text-lg hover:brightness-110 shadow-lg active:scale-95 transition-all uppercase tracking-wide`}
                                >
                                    <RotateCcw size={22} strokeWidth={3} /> Play Again
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default GameContainer;
