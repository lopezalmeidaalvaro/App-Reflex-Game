import React from 'react';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

export default function BackButton({ onBack }) {
    if (typeof onBack !== 'function') {
        console.warn("BackButton Error: 'onBack' prop must be a function.");
        return null;
    }

    return (
        <div className="absolute top-6 left-6 z-50 pointer-events-auto">
            <motion.button
                onPointerDown={(e) => {
                    e.stopPropagation();
                    onBack();
                }}
                whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md text-white px-4 py-2 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-slate-700 hover:bg-slate-700 transition-colors w-fit"
            >
                <Home size={18} />
                <span className="font-semibold tracking-wide text-sm">Back to Menu</span>
            </motion.button>
        </div>
    );
}

