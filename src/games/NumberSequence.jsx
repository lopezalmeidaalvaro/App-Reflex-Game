import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const GRID_SIZE = 9;

const NumberSequence = ({ onFinish, theme }) => {
    const [numbers, setNumbers] = useState([]);
    const [expectedNext, setExpectedNext] = useState(1);
    const [errorHighlight, setErrorHighlight] = useState(null);
    const startTime = useRef(0);

    useEffect(() => {
        // Generate array [1..9], shuffle
        const arr = Array.from({ length: GRID_SIZE }, (_, i) => i + 1);
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        setNumbers(arr.map(num => ({ value: num, active: true })));
        startTime.current = performance.now();
    }, []);

    const handleNumberClick = (num) => {
        if (num.value === expectedNext) {
            // Correct!
            setNumbers(prev => prev.map(n => n.value === num.value ? { ...n, active: false } : n));

            if (expectedNext === GRID_SIZE) {
                // Done!
                const totalTime = performance.now() - startTime.current;
                onFinish(totalTime);
            } else {
                setExpectedNext(expectedNext + 1);
            }
        } else {
            // Incorrect! show visual error on that tile
            setErrorHighlight(num.value);
            setTimeout(() => setErrorHighlight(null), 300); // 300ms error flash
        }
    };

    return (
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-4">
            <div className="absolute top-10 left-1/2 -translate-x-1/2 text-xl text-slate-500 font-bold uppercase tracking-[0.2em]">
                Next Target <span className={`text-4xl text-white block text-center mt-2 ${theme.text}`}>{expectedNext}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-4 w-full max-w-[400px] aspect-square">
                {numbers.map((num, idx) => (
                    num.active ? (
                        <motion.button
                            key={num.value}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                x: errorHighlight === num.value ? [-5, 5, -5, 5, 0] : 0 // shake animation
                            }}
                            transition={{ type: "spring", delay: 0.05 * idx, duration: errorHighlight === num.value ? 0.3 : 0.5 }}
                            whileTap={{ scale: 0.95 }}
                            onPointerDown={() => handleNumberClick(num)}
                            className={`bg-dark-surface border-[3px] rounded-3xl flex items-center justify-center text-4xl md:text-5xl font-black text-white shadow-xl transition-colors
                ${errorHighlight === num.value ? 'border-red-500 text-red-500 bg-red-500/10' : `border-slate-700 hover:border-slate-500 active:${theme.border}`}`}
                            style={{ touchAction: 'none' }}
                        >
                            {num.value}
                        </motion.button>
                    ) : (
                        <motion.div
                            key={num.value}
                            initial={{ scale: 1, opacity: 1 }}
                            animate={{ scale: 0.8, opacity: 0 }}
                            className={`border-[3px] ${theme.border} border-opacity-30 rounded-3xl`}
                        />
                    )
                ))}
            </div>
        </div>
    );
};

export default NumberSequence;
