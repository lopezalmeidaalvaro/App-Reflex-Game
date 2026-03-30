import React, { useState, useEffect, useRef } from 'react';

const TARGETS_TOTAL = 10;
const TARGET_SIZE = 70; // 70px diameter

const PrecisionAim = ({ onFinish, theme }) => {
    const [targetsLeft, setTargetsLeft] = useState(TARGETS_TOTAL);
    const [targetPos, setTargetPos] = useState(null); // Load null first to avoid flash at 0,0
    const startTime = useRef(0);

    useEffect(() => {
        startTime.current = performance.now();
        moveTarget();
    }, []);

    const moveTarget = () => {
        // Range 10 to 90 to keep inside screen boundaries
        const x = Math.floor(Math.random() * 80) + 10;
        const y = Math.floor(Math.random() * 80) + 10;
        setTargetPos({ x, y });
    };

    const handleTargetClick = (e) => {
        e.stopPropagation();
        if (targetsLeft === 1) {
            const totalTime = performance.now() - startTime.current;
            onFinish(totalTime);
        } else {
            setTargetsLeft(prev => prev - 1);
            moveTarget();
        }
    };

    const handleMiss = () => {
        // Optional: could add time penalty
    };

    if (!targetPos) return null;

    return (
        <div
            className="absolute inset-0 w-full h-full cursor-crosshair active:bg-slate-900/40 transition-colors"
            onPointerDown={handleMiss}
        >
            <div className="absolute top-10 left-1/2 -translate-x-1/2 text-slate-500 font-black uppercase tracking-[0.3em] pointer-events-none">
                Targets <span className={`text-white ml-2 ${theme.text}`}>{targetsLeft}</span>
            </div>

            <div
                className={`absolute rounded-full cursor-pointer transition-transform active:scale-95 hover:brightness-125 ${theme.bg} ${theme.glow}`}
                style={{
                    width: TARGET_SIZE,
                    height: TARGET_SIZE,
                    left: `calc(${targetPos.x}% - ${TARGET_SIZE / 2}px)`,
                    top: `calc(${targetPos.y}% - ${TARGET_SIZE / 2}px)`,
                    touchAction: 'none' // critical to prevent default browser gestures on mobile
                }}
                onPointerDown={handleTargetClick}
            />
        </div>
    );
};

export default PrecisionAim;
