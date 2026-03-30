import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const TARGET_COUNT = 10;
const TARGET_SIZE = 50; // px

export default function AimGame({ onFinish, theme }) {
    const [clicked, setClicked] = useState(0);
    const [pos, setPos] = useState({ x: 50, y: 50 }); // percentages

    const gameStart = useRef(0);

    useEffect(() => {
        gameStart.current = performance.now();
        randomizePosition();
    }, []);

    const randomizePosition = () => {
        // Constraints to keep circle fully in bounds (max 90, min 10)
        const x = Math.random() * 80 + 10;
        const y = Math.random() * 80 + 10;
        setPos({ x, y });
    };

    const handleHit = (e) => {
        e.preventDefault();
        e.stopPropagation(); // Avoid parent click event

        const count = clicked + 1;
        if (count >= TARGET_COUNT) {
            const totalTime = performance.now() - gameStart.current;
            const averageTimePerClick = totalTime / TARGET_COUNT; // requested: time promedio por clic
            onFinish(averageTimePerClick, false);
        } else {
            setClicked(count);
            randomizePosition();
        }
    };

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden touch-none select-none">
            <div className="absolute top-10 left-0 w-full text-center text-slate-500 font-bold tracking-[0.3em] uppercase opacity-50 pointer-events-none">
                Targets: <span className="text-white ml-2">{clicked}/{TARGET_COUNT}</span>
            </div>

            <motion.div
                key={`${clicked}`} // Re-animate entry per click
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onPointerDown={handleHit}
                className={`absolute rounded-full cursor-crosshair shadow-[0_0_20px_currentColor] active:scale-95 z-10 ${theme.bgColor} ${theme.color}`}
                style={{
                    width: TARGET_SIZE,
                    height: TARGET_SIZE,
                    left: `calc(${pos.x}% - ${TARGET_SIZE / 2}px)`,
                    top: `calc(${pos.y}% - ${TARGET_SIZE / 2}px)`,
                }}
            />
        </div>
    );
}
