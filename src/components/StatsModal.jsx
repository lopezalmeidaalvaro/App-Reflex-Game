import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function StatsModal({ gameId, gameTitle, history, onClose }) {
    // Format data for Recharts
    const data = history.map((entry, index) => ({
        name: `A${index + 1}`,
        tiempo: Math.round(entry.score),
        date: new Date(entry.date).toLocaleDateString()
    }));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm pointer-events-auto"
            onPointerDown={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl relative"
                onPointerDown={e => e.stopPropagation()} // Prevent click-through closing
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h3 className="text-2xl font-black mb-1 tracking-tight text-white">Progression: {gameTitle}</h3>
                <p className="text-sm text-slate-400 mb-8 tracking-wide font-medium">Last {history.length} attempts</p>

                {history.length > 1 ? (
                    <div className="w-full h-64 md:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <Line
                                    type="monotone"
                                    dataKey="tiempo"
                                    stroke="#34d399" // emerald-400
                                    strokeWidth={4}
                                    dot={{ r: 5, fill: "#0f172a", stroke: "#34d399", strokeWidth: 2 }}
                                    activeDot={{ r: 8, fill: "#34d399", stroke: "#0f172a", strokeWidth: 3 }}
                                />
                                <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#64748b"
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                    axisLine={false}
                                    tickLine={false}
                                    domain={['dataMin - 10', 'dataMax + 10']}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '1rem', fontWeight: 600 }}
                                    itemStyle={{ color: '#34d399' }}
                                    labelStyle={{ color: '#94a3b8', marginBottom: '0.25rem' }}
                                    formatter={(value) => [`${value} ms`, 'Time']}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="w-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-700/50 rounded-2xl">
                        <span className="text-slate-500 font-bold mb-2">Not enough data.</span>
                        <span className="text-slate-600 text-sm">Play at least 2 times to see the graph.</span>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
