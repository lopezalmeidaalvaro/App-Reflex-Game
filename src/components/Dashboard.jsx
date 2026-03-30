import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Zap, Crosshair, Hash } from 'lucide-react';
import { getHighScores } from '../utils/stats';

const iconMap = {
    reaction: <Zap size={32} />,
    aim: <Crosshair size={32} />,
    sequence: <Hash size={32} />,
};

// Map to fixed tailwind classes to avoid purgecss issues
const colorMap = {
    reaction: { text: 'text-neon-red', bg: 'bg-neon-red', border: 'hover:border-neon-red', lightBg: 'bg-neon-red/10', gradient: 'from-neon-red' },
    aim: { text: 'text-neon-blue', bg: 'bg-neon-blue', border: 'hover:border-neon-blue', lightBg: 'bg-neon-blue/10', gradient: 'from-neon-blue' },
    sequence: { text: 'text-neon-green', bg: 'bg-neon-green', border: 'hover:border-neon-green', lightBg: 'bg-neon-green/10', gradient: 'from-neon-green' }
};

const Dashboard = ({ games, onSelectGame }) => {
    const [highScores, setHighScores] = useState({});

    useEffect(() => {
        setHighScores(getHighScores());
    }, []);

    return (
        <div className="flex flex-col items-center justify-start h-full max-w-4xl mx-auto w-full pt-10 px-4">
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-12"
            >
                <h1 className="text-5xl md:text-6xl font-black mb-2 tracking-tighter">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-blue via-neon-green to-neon-red drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                        REFLEX ARENA
                    </span>
                </h1>
                <p className="text-slate-400 mt-2 text-lg font-medium">Test and improve your cognitive reflexes.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {games.map((game, index) => {
                    const pb = highScores[game.id];
                    const colors = colorMap[game.id];
                    return (
                        <motion.div
                            key={game.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                            whileHover={{ scale: 1.03, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelectGame(game.id)}
                            className={`bg-dark-surface p-6 rounded-3xl cursor-pointer border-2 border-transparent ${colors.border} transition-all duration-300 flex flex-col justify-between overflow-hidden relative group shadow-[0_4px_20px_rgba(0,0,0,0.5)]`}
                        >
                            {/* Top ambient glow */}
                            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-2 ${colors.bg} rounded-full opacity-50 blur-md group-hover:opacity-100 transition-opacity`} />

                            <div className="mb-4 pt-2">
                                <div className={`${colors.text} mb-5 p-3 ${colors.lightBg} inline-block rounded-2xl shadow-lg`}>
                                    {iconMap[game.id]}
                                </div>
                                <h2 className="text-2xl font-bold mb-2 tracking-wide text-white">{game.title}</h2>
                                <p className="text-slate-400 text-sm leading-relaxed min-h-[44px]">{game.description}</p>
                            </div>

                            <div className="flex justify-between items-end mt-6 pb-2">
                                <div className="flex flex-col border-l-2 border-slate-700 pl-3">
                                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">BEST RECORD</span>
                                    <span className="font-mono text-xl font-bold text-white tracking-wider drop-shadow-md">
                                        {pb ? `${pb} ms` : '---'}
                                    </span>
                                </div>
                                <button className={`${colors.lightBg} ${colors.text} p-4 rounded-2xl group-hover:${colors.bg} group-hover:text-dark transition-colors`}>
                                    <Play size={20} className="ml-1" fill="currentColor" />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default Dashboard;
