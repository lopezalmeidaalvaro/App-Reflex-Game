import React, { useState, useEffect, useRef } from 'react';

export default function ReactionGame({ onFinish }) {
    const [status, setStatus] = useState('WAITING'); // 'WAITING', 'READY' (Green)
    const startTime = useRef(0);
    const timeoutId = useRef(null);

    useEffect(() => {
        // Random wait between 2s and 5s
        const randomDelay = Math.random() * 3000 + 2000;

        timeoutId.current = setTimeout(() => {
            setStatus('READY');
            startTime.current = performance.now();
        }, randomDelay);

        return () => {
            if (timeoutId.current) clearTimeout(timeoutId.current);
        };
    }, []);

    const handleInteract = (e) => {
        // Crucial: Use preventDefault to avoid double-firing events on some mobile browsers
        if (e) e.preventDefault();
        if (e && e.stopPropagation) e.stopPropagation();

        if (status === 'WAITING') {
            if (timeoutId.current) clearTimeout(timeoutId.current);
            onFinish(null, true); // False start
        } else if (status === 'READY') {
            const reactionTime = performance.now() - startTime.current;
            onFinish(reactionTime, false);
        }
    };

    return (
        <div
            className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center cursor-pointer select-none touch-none transition-colors duration-[50ms]
        ${status === 'WAITING' ? 'bg-neon-red shadow-[inset_0_0_100px_rgba(255,7,58,0.3)]' : 'bg-neon-green shadow-[inset_0_0_100px_rgba(57,255,20,0.3)]'}
      `}
            // onPointerDown solves mobile delay instantly
            onPointerDown={handleInteract}
        >
            <h2 className="z-10 text-5xl md:text-[5rem] font-black text-dark-bg uppercase tracking-[0.2em] pointer-events-none text-center px-4">
                {status === 'WAITING' ? 'Wait...' : 'CLICK!'}
            </h2>
        </div>
    );
}
