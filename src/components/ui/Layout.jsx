import React from 'react';

export default function Layout({ children }) {
    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-dark-bg overflow-hidden relative touch-none">
            {/* Background ambient accents for "Dark Gamer" aesthetic */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-neon-blue/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-neon-red/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] bg-neon-green/5 rounded-full blur-[100px] pointer-events-none" />

            <main className="flex-1 w-full max-w-5xl px-4 py-8 flex items-center justify-center z-10 relative">
                {children}
            </main>
        </div>
    );
}
