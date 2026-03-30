import { useState, useEffect } from 'react';

export function useStreak() {
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        try {
            const stored = window.localStorage.getItem('reflex_games_streak');
            const now = new Date();
            now.setHours(0, 0, 0, 0); // Normalize to start of today

            if (!stored) {
                // First ever login
                setStreak(1);
                window.localStorage.setItem('reflex_games_streak', JSON.stringify({ streak: 1, lastLogin: now.getTime() }));
                return;
            }

            const { streak: currentStreak, lastLogin } = JSON.parse(stored);

            const lastLoginDate = new Date(lastLogin);
            const diffTime = Math.abs(now - lastLoginDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Logged in yesterday
                const newStreak = currentStreak + 1;
                setStreak(newStreak);
                window.localStorage.setItem('reflex_games_streak', JSON.stringify({ streak: newStreak, lastLogin: now.getTime() }));
            } else if (diffDays === 0) {
                // Already logged in today
                setStreak(currentStreak);
            } else {
                // Missed a day
                setStreak(1);
                window.localStorage.setItem('reflex_games_streak', JSON.stringify({ streak: 1, lastLogin: now.getTime() }));
            }
        } catch (error) {
            console.warn('Error reading streak', error);
            setStreak(1);
        }
    }, []);

    return streak;
}
