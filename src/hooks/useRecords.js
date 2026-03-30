import { useState } from 'react';

export function useRecords() {
    const [records, setRecords] = useState(() => {
        if (typeof window === "undefined") return { reaction: null, aim: null, sequence: null };
        try {
            const item = window.localStorage.getItem('reflex_games_v2_records');
            if (item) {
                return JSON.parse(item);
            } else {
                // Migration from v1 or start fresh
                const oldItem = window.localStorage.getItem('reflex_games_records');
                let oldRecords = { reaction: null, aim: null, sequence: null };
                if (oldItem) {
                    try { oldRecords = JSON.parse(oldItem); } catch (e) { }
                }

                const initial = {
                    reaction: { best: oldRecords.reaction, history: [] },
                    aim: { best: oldRecords.aim, history: [] },
                    sequence: { best: oldRecords.sequence, history: [] },
                    chimp: { best: null, history: [] },
                    audio: { best: null, history: [] },
                    tracking: { best: null, history: [] }
                };
                return initial;
            }
        } catch (error) {
            console.warn("Error reading localStorage", error);
            return { reaction: { best: null, history: [] } }; // Fallback
        }
    });

    const saveRecord = (gameId, newTime) => {
        setRecords(prev => {
            // Ensure the game structure exists
            const currentData = prev[gameId] || { best: null, history: [] };

            const newHistoryEntry = { date: Date.now(), score: newTime };
            // Keep last 20 entries
            const newHistory = [...currentData.history, newHistoryEntry].slice(-20);

            const newBest = (currentData.best === null || newTime < currentData.best) ? newTime : currentData.best;

            const updated = {
                ...prev,
                [gameId]: {
                    best: newBest,
                    history: newHistory
                }
            };

            if (typeof window !== "undefined") {
                window.localStorage.setItem('reflex_games_v2_records', JSON.stringify(updated));
            }
            return updated;
        });
    };

    return { records, saveRecord };
}
