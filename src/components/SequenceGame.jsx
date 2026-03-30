import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3x3, RotateCcw } from 'lucide-react';
import { useGameFeel } from '../hooks/useGameFeel';
import BackButton from './ui/BackButton';

export default function SequenceGame({ onBack, onSaveRecord }) {
    const [gameState, setGameState] = useState('idle'); // idle, playing, error, result
    const [grid, setGrid] = useState([]);
    const [expectedValue, setExpectedValue] = useState(1);
    const [totalTime, setTotalTime] = useState(null);
    const [flashingTile, setFlashingTile] = useState(null);

    const { triggerSuccess, triggerFail, triggerStart } = useGameFeel();

    const startTime = useRef(0);
    const timeoutIds = useRef(new Set());
    const isProcessing = useRef(false);

    useEffect(() => {
        return () => {
            timeoutIds.current.forEach(clearTimeout);
            timeoutIds.current.clear();
        };
    }, []);

    const safeSetTimeout = (callback, delay) => {
        const id = setTimeout(() => {
            callback();
            timeoutIds.current.delete(id);
        }, delay);
        timeoutIds.current.add(id);
        return id;
    };

    const startGame = () => {
        if (isProcessing.current) return;
        triggerStart();
        
        // Estado inicializado correctamente (sanitización de estado)
        const arr = Array.from({ length: 9 }, (_, i) => i + 1);
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }

        setGrid(arr.map(val => ({ val, active: true })));
        setExpectedValue(1);
        setGameState('playing');
        setTotalTime(null);
        setFlashingTile(null);
        isProcessing.current = false;
        
        timeoutIds.current.forEach(clearTimeout);
        timeoutIds.current.clear();
        startTime.current = performance.now();
    };

    const handleTap = (num) => {
        // Validación de Eventos (Anti-Spam)
        if (gameState !== 'playing' || !num.active || isProcessing.current) return;

        isProcessing.current = true;

        if (num.val === expectedValue) {
            triggerSuccess();
            setFlashingTile(num.val);
            
            safeSetTimeout(() => {
                setGrid(prev => prev.map(n => n.val === num.val ? { ...n, active: false } : n));
                setFlashingTile(null);
                
                const nextTarget = expectedValue + 1;

                if (nextTarget > 9) {
                    const time = performance.now() - startTime.current;
                    setTotalTime(time);
                    setGameState('result');
                    
                    // Manejo de Errores (Error Handling) en el guardado
                    try {
                        if (typeof onSaveRecord === 'function') {
                            onSaveRecord(time);
                        }
                    } catch (error) {
                        console.error('SequenceGame: Error silencioso al intentar guardar registro.', error);
                    }
                } else {
                    setExpectedValue(nextTarget);
                }
                
                isProcessing.current = false;
            }, 150); // Muestra el destello verde brevemente antes de desaparecer el botón
        } else {
            triggerFail();
            setGameState('error');
            
            safeSetTimeout(() => {
                isProcessing.current = false;
                startGame();
            }, 600);
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
                        <Grid3x3 size={48} className="text-fuchsia-400 mb-6 drop-shadow-[0_0_10px_rgba(232,121,249,0.8)]" />
                        <h1 className="text-4xl font-black mb-4 tracking-tight text-white text-center">Memoria Rápida</h1>
                        <p className="text-slate-400 text-base mb-8 text-center max-w-sm">
                            Pulsa los números en estricto orden secuencial. Si te equivocas, la partida se reinicia.
                        </p>
                        <button
                            onPointerDown={(e) => { e.stopPropagation(); startGame(); }}
                            className="bg-fuchsia-500 text-slate-900 px-10 py-4 rounded-xl font-black text-xl uppercase tracking-widest hover:bg-fuchsia-400 active:scale-95 shadow-[0_0_20px_rgba(232,121,249,0.4)] transition-all w-full"
                        >
                            Comenzar
                        </button>
                    </motion.div>
                )}

                {(gameState === 'playing' || gameState === 'error') && (
                    <motion.div
                        key="playing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center w-full px-4"
                    >
                        <div className="text-slate-500 font-bold tracking-[0.2em] mb-8 text-xl min-h-[4rem]">
                            <>SIGUIENTE: <span className={`text-4xl block text-center mt-2 ${gameState === 'error' ? 'text-white' : 'text-fuchsia-400'} drop-shadow-[0_0_15px_currentColor]`}>{expectedValue}</span></>
                        </div>

                        <div className="grid grid-cols-3 gap-3 md:gap-4 w-full max-w-[400px] aspect-square">
                            {grid.map((num) => (
                                <div key={num.val} className="w-full h-full relative">
                                    {num.active ? (
                                        <motion.button
                                            layoutId={`btn-${num.val}`}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{
                                                scale: 1,
                                                opacity: 1,
                                                x: gameState === 'error' ? [-10, 10, -10, 10, 0] : 0,
                                            }}
                                            transition={{ duration: gameState === 'error' ? 0.3 : 0.2 }}
                                            whileTap={{ scale: 0.9 }}
                                            onPointerDown={(e) => { e.preventDefault(); handleTap(num); }}
                                            className={`absolute inset-0 w-full h-full border-2 rounded-2xl flex items-center justify-center text-4xl font-bold shadow-lg touch-none select-none transition-colors
                                                ${gameState === 'error'
                                                    ? 'border-white text-white bg-red-400/20 shadow-xl'
                                                    : flashingTile === num.val
                                                        ? 'border-green-400 text-green-400 bg-green-400/20 shadow-[0_0_20px_rgba(74,222,128,0.5)]'
                                                        : 'border-slate-600 hover:border-slate-500 text-white bg-slate-800 hover:bg-slate-700'
                                                }
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
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Completado</h2>
                        <div className="text-6xl md:text-7xl font-mono font-black text-fuchsia-400 mb-10 drop-shadow-[0_0_20px_rgba(232,121,249,0.3)]">
                            {Math.round(totalTime)}<span className="text-3xl font-sans text-slate-500 ml-2">ms</span>
                        </div>

                        <button
                            onPointerDown={(e) => { e.stopPropagation(); startGame(); }}
                            className="w-full flex items-center justify-center gap-3 bg-fuchsia-500 text-slate-900 px-8 py-4 rounded-xl font-black text-lg uppercase tracking-wide hover:bg-fuchsia-400 active:scale-95 transition-all shadow-[0_0_20px_rgba(232,121,249,0.4)]"
                        >
                            <RotateCcw size={22} /> Jugar de nuevo
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
