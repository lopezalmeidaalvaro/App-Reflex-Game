import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function SequenceGame({ onFinish, theme }) {
    const [grid, setGrid] = useState([]);
    const [expectedValue, setExpectedValue] = useState(1);
    const [errorHighlight, setErrorHighlight] = useState(false);

    const gameStart = useRef(0);

    useEffect(() => {
        // Generate array [1..9] and shuffle it properly
        const sequence = Array.from({ length: 9 }, (_, i) => i + 1);
        for (let i = sequence.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
        }

        // Map to state objects
        setGrid(sequence.map(val => ({ val, active: true })));
        gameStart.current = performance.now();
    }, []);

    const handleTap = (num) => {
        if (!num.active) return;

        if (num.val === expectedValue) {
            // Correct! Disable tile
            setGrid(prev => prev.map(n => n.val === num.val ? { ...n, active: false } : n));

            const nextTarget = expectedValue + 1;

            if (nextTarget > 9) {
                // Game Completed
                const total = performance.now() - gameStart.current;
                onFinish(total, false); // success
            } else {
                setExpectedValue(nextTarget);
            }
        } else {
            // Failed sequence! As requested: "Si falla, el juego termina."
            setErrorHighlight(true);
            setTimeout(() => {
                onFinish(null, true); // fail
            }, 400); // short delay to show the error state before ending
        }
    };

    return (
        <div className={`w-full h-full flex flex-col items-center justify-center p-4 transition-colors ${errorHighlight ? 'bg-neon-red/10' : ''}`}>
            <div className="text-slate-500 font-bold tracking-[0.2em] mb-8 text-xl">
                NEXT: <span className={`text-4xl text-white block text-center mt-2 ${theme.color} drop-shadow-[0_0_15px_currentColor]`}>{expectedValue}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-4 w-full max-w-[400px] aspect-square">
                {grid.map((num) => (
                    <div key={num.val} className="w-full h-full">
                        {num.active && (
                            <motion.button
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: 1,
                                    opacity: 1,
                                    x: errorHighlight ? [-10, 10, -10, 10, 0] : 0
                                }}
                                transition={{ duration: errorHighlight ? 0.4 : 0.2 }}
                                whileTap={{ scale: 0.9 }}
                                onPointerDown={(e) => { e.preventDefault(); handleTap(num); }}
                                className={`w-full h-full border-2 rounded-[2rem] flex items-center justify-center text-5xl font-black shadow-xl touch-none select-none
                  ${errorHighlight
                                        ? 'border-neon-red text-neon-red bg-neon-red/10 shadow-[0_0_20px_var(--color-neon-red)]'
                                        : `border-slate-700 hover:border-slate-500 text-white bg-dark-surface active:bg-slate-800`
                                    }
                `}
                            >
                                {num.val}
                            </motion.button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
