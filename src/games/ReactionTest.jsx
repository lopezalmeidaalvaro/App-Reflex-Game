import React, { useState, useEffect, useRef } from 'react';

const ReactionTest = ({ onFinish }) => {
    const [state, setState] = useState('WAITING'); // WAITING (Red), GO (Green)
    const startTime = useRef(0);
    const timeoutId = useRef(null);

    useEffect(() => {
        // Random wait between 2s and 5s
        const delay = Math.floor(Math.random() * 3000) + 2000;

        timeoutId.current = setTimeout(() => {
            setState('GO');
            startTime.current = performance.now();
        }, delay);

        return () => clearTimeout(timeoutId.current);
    }, []);

    const handleClick = (e) => {
        e.preventDefault(); // Prevent standard click behavior or double firing
        if (state === 'WAITING') {
            clearTimeout(timeoutId.current);
            onFinish(false); // FAILED
        } else if (state === 'GO') {
            const reactionTime = performance.now() - startTime.current;
            onFinish(reactionTime);
        }
    };

    return (
        <div
            className={`absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer transition-colors duration-200 select-none
        ${state === 'WAITING' ? 'bg-neon-red text-dark' : 'bg-neon-green text-dark'}`}
            onPointerDown={handleClick} // onPointerDown for zero latency mobile+desktop
        >
            <div className="text-4xl md:text-6xl font-black uppercase tracking-widest pointer-events-none drop-shadow-lg text-center px-4">
                {state === 'WAITING' ? 'Wait for Green...' : 'CLICK NOW!'}
            </div>
        </div>
    );
};

export default ReactionTest;
