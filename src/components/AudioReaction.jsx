import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioLines, RotateCcw } from 'lucide-react';
import { useGameFeel } from '../hooks/useGameFeel';
import BackButton from './ui/BackButton';

export default function AudioReaction({ onBack, onSaveRecord }) {
    const [gameState, setGameState] = useState('idle'); // idle, waiting, early, result
    const [reactionTime, setReactionTime] = useState(null);

    const { triggerSuccess, triggerFail, triggerStart } = useGameFeel();

    const startTime = useRef(0);
    const timeoutId = useRef(null);
    const beepSound = useRef(null);

    useEffect(() => {
        return () => {
            if (timeoutId.current) clearTimeout(timeoutId.current);
            if (beepSound.current) {
                beepSound.current.pause();
                beepSound.current.currentTime = 0;
            }
        };
    }, []);

    const startGame = () => {
        triggerStart();
        setGameState('waiting');
        setReactionTime(null);

        if (!beepSound.current) {
            // ¡AQUÍ ESTÁ LA MAGIA DE VITE! Añadimos import.meta.env.BASE_URL
            beepSound.current = new Audio(import.meta.env.BASE_URL + 'sfx/bloop.mp3');
        }

        // Apply AudioContext Unlocking Pattern
        beepSound.current.volume = 0;
        beepSound.current.play().then(() => {
            beepSound.current.pause();
            beepSound.current.currentTime = 0;
            beepSound.current.volume = 1;
        }).catch(e => console.warn("Unlock failed:", e));

        // Wait random time between 2 and 5 seconds
        const waitTime = Math.random() * 3000 + 2000;

        timeoutId.current = setTimeout(() => {
            try {
                beepSound.current.play();
            } catch (error) {
                console.warn("El audio fue bloqueado por el navegador o no se encontró el archivo:", error);
            }

            startTime.current = performance.now();
            setGameState('stimulus');
        }, waitTime);
    };

    const handleClick = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (gameState === 'idle') {
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

    let bgColor = "bg-slate-900"; // Always dark except on failure
    if (gameState === 'early') bgColor = "bg-red-500 shadow-[inset_0_0_100px_rgba(239,68,68,0.7)]";

    return (
        <motion.div
            className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center transition-colors duration-100 touch-none select-none ${bgColor}`}
            initial={{ opacity: 0 }}
            animate={{
                opacity: 1,
                backgroundColor: gameState === 'early' ? '#ef4444' : '#0f172a',
                x: gameState === 'early' ? [-15, 15, -15, 15, 0] : 0
            }}
            transition={{ x: { duration: 0.3 } }}
            exit={{ opacity: 0 }}
            onPointerDown={handleClick}
        >
            <BackButton onBack={onBack} />

            <AnimatePresence mode="wait">
                {gameState === 'idle' && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center p-8 bg-slate-800/80 rounded-[2rem] border border-slate-700 shadow-2xl z-40 max-w-sm mx-4 text-center pointer-events-none"
                    >
                        <AudioLines size={64} className="text-indigo-400 mb-6 drop-shadow-[0_0_20px_rgba(129,140,248,0.5)]" />
                        <h1 className="text-4xl font-black mb-4 tracking-tight text-white">Audio Reaction</h1>
                        <p className="text-slate-400 text-base mb-8 font-medium">
                            Espera el sonido. Haz clic lo más rápido posible. Cierra los ojos si ayuda.
                        </p>
                        <div className="text-slate-500 font-bold uppercase tracking-widest text-sm animate-pulse-slow">
                            Haz clic para iniciar
                        </div>
                    </motion.div>
                )}

                {gameState === 'waiting' && (
                    <motion.div
                        key="waiting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-4xl md:text-6xl font-black text-slate-700 tracking-widest animate-pulse pointer-events-none"
                    >
                        ...
                    </motion.div>
                )}

                {gameState === 'stimulus' && (
                    <motion.div
                        key="stimulus"
                        initial={{ opacity: 0, scale: 2 }}
                        animate={{ opacity: 1, scale: 1, rotate: [0, -5, 5, 0] }}
                        className="pointer-events-none"
                    >
                        <AudioLines size={120} className="text-indigo-400 drop-shadow-[0_0_50px_rgba(129,140,248,1)]" />
                    </motion.div>
                )}

                {gameState === 'early' && (
                    <motion.div
                        key="early"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center pointer-events-none"
                    >
                        <div className="text-5xl md:text-7xl font-black text-white mb-4 drop-shadow-xl text-center">¡Muy Pronto!</div>
                        <div className="text-white/80 font-bold text-xl uppercase tracking-widest text-center">Espera al sonido</div>
                    </motion.div>
                )}

                {gameState === 'result' && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center p-10 bg-slate-800/90 backdrop-blur-md rounded-[2rem] border border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-40 max-w-sm w-full mx-4 text-center pointer-events-none"
                    >
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Reacción Auditiva</h2>
                        <div className="text-6xl md:text-7xl font-mono font-black text-indigo-400 mb-10 drop-shadow-[0_0_20px_rgba(129,140,248,0.4)]">
                            {Math.round(reactionTime)}<span className="text-3xl font-sans text-slate-500 ml-2">ms</span>
                        </div>

                        <button
                            onPointerDown={(e) => { e.stopPropagation(); startGame(); }}
                            className="w-full flex items-center justify-center gap-3 bg-indigo-500 text-white px-8 py-4 rounded-xl font-black text-lg uppercase tracking-wide hover:bg-indigo-400 active:scale-95 transition-all shadow-[0_0_20px_rgba(129,140,248,0.4)] pointer-events-auto"
                        >
                            <RotateCcw size={22} /> Repetir
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}