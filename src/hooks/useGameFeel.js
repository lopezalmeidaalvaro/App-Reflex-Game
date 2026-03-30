import { useCallback } from 'react';

// Create generic audio objects if we are in browser
let sfxPop, sfxBuzzer;

if (typeof window !== 'undefined') {
    sfxPop = new Audio('/sfx/pop.mp3');
    sfxBuzzer = new Audio('/sfx/error.mp3');

    // Set volume reasonably
    sfxPop.volume = 0.5;
    sfxBuzzer.volume = 0.3;
}

export function useGameFeel() {

    const triggerSuccess = useCallback(() => {
        // Vibrate: short tap
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(50);
        }
        // Audio
        if (sfxPop) {
            sfxPop.currentTime = 0;
            sfxPop.play().catch(e => console.warn('Audio play prevented', e));
        }
    }, []);

    const triggerFail = useCallback(() => {
        // Vibrate: error pattern
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
        // Audio
        if (sfxBuzzer) {
            sfxBuzzer.currentTime = 0;
            sfxBuzzer.play().catch(e => console.warn('Audio play prevented', e));
        }
    }, []);

    const triggerStart = useCallback(() => {
        // Vibrate: medium tap
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(100);
        }
    }, []);

    return { triggerSuccess, triggerFail, triggerStart };
}
