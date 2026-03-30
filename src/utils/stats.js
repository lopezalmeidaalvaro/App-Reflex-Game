export const getHighScores = () => {
    const scores = localStorage.getItem('reflexGamesHighScores');
    return scores ? JSON.parse(scores) : {
        reaction: null,
        aim: null,
        sequence: null
    };
};

export const saveHighScore = (game, score) => {
    const scores = getHighScores();
    // Lower score is better (time in ms)
    if (scores[game] === null || score < scores[game]) {
        scores[game] = score;
        localStorage.setItem('reflexGamesHighScores', JSON.stringify(scores));
        return true; // New high score
    }
    return false;
};
