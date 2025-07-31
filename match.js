/**
 * @file This file contains the logic for an active tennis match.
 * @author [Your Name]
 */

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('id');
    const matchInfoSection = document.getElementById('match-info');
    const pointButtons = document.querySelectorAll('.point-btn');
    const undoBtn = document.getElementById('undo-btn');
    const setScoreDisplay = document.getElementById('set-score');
    const gameScoreDisplay = document.getElementById('game-score');
    const serverSelectionSection = document.getElementById('server-selection');
    const playerServesBtn = document.getElementById('player-serves-btn');
    const opponentServesBtn = document.getElementById('opponent-serves-btn');
    const playerServerIndicator = document.getElementById('player-server-indicator');
    const opponentServerIndicator = document.getElementById('opponent-server-indicator');

    let isFirstFault = false;
    let match = JSON.parse(sessionStorage.getItem('activeMatch'));
    if (!match || match.id !== matchId) {
        let matches = JSON.parse(localStorage.getItem('matches')) || [];
        match = matches.find(m => m.id === matchId);
    }

    if (match) {
        updateScore();

        if (!match.initialServer) {
            serverSelectionSection.style.display = 'block';
        } else {
            updateServeButtons();
            updateServerIndicators();
        }

        playerServesBtn.addEventListener('click', () => setServer('player'));
        opponentServesBtn.addEventListener('click', () => setServer('opponent'));

        pointButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (match.server) {
                    const player = button.dataset.player;
                    const outcome = button.dataset.outcome;
                    addPoint(player, outcome);
                } else {
                    alert('Please select who is serving first.');
                }
            });
        });

        undoBtn.addEventListener('click', () => {
            if (match.points.length > 0) {
                const lastPoint = match.points.pop();
                if (lastPoint.outcome === 'double-fault') {
                    // If the last point was a double fault, the point before it must have been a fault.
                    // So we need to remove the double fault, and the fault before it.
                    // And set the state to isFirstFault = true
                    if(match.points.length > 0 && match.points[match.points.length-1].outcome === 'fault') {
                        match.points.pop();
                        isFirstFault = true;
                    }
                } else if (lastPoint.outcome === 'fault') {
                    isFirstFault = false;
                }
                updateScore();
                saveMatches();
            }
        });

    } else {
        console.error('Match not found.');
        window.location.href = 'index.html';
    }

    /**
     * Sets the server for the match.
     * @param {string} server - The player who is serving ('player' or 'opponent').
     */
    function setServer(server) {
        match.initialServer = server;
        match.server = server;
        serverSelectionSection.style.display = 'none';
        updateServeButtons();
        updateServerIndicators();
        saveMatches();
    }

    /**
     * Adds a point to the match.
     * @param {string} player - The player who won the point ('player' or 'opponent').
     * @param {string} outcome - The outcome of the point.
     */
    function addPoint(player, outcome) {
        if (outcome === 'fault') {
            if (isFirstFault) {
                // This is the second fault, so it's a double fault.
                match.points.push({
                    player: player,
                    outcome: 'double-fault',
                    timestamp: Date.now()
                });
                isFirstFault = false; // Reset for the next point
                updateScore();
            } else {
                // This is the first fault.
                isFirstFault = true;
                match.points.push({
                    player: player,
                    outcome: 'fault',
                    timestamp: Date.now()
                });
            }
        } else {
            // Any other event (winner, ace, error) resets the fault state.
            isFirstFault = false;
            match.points.push({
                player: player,
                outcome: outcome,
                timestamp: Date.now()
            });
            updateScore();
        }
        saveMatches();
    }

    /**
     * Updates the score display.
     */
    function updateScore() {
        const filteredPoints = match.points.filter(p => p.outcome !== 'fault');
        const score = calculateScore(filteredPoints, match.format, match.scoring, match.initialServer);
        
        if (score.isMatchOver) {
            match.completed = true;
            match.winner = score.winner;
            match.finalScore = score.finalScore;
            saveMatches();
            alert(`Match Over! ${score.winner} wins!`);
            window.location.href = 'index.html';
            return;
        }

        if (match.format === 'pro-set-8-games') {
            setScoreDisplay.textContent = score.sets;
            if (score.isTiebreak) {
                gameScoreDisplay.style.display = 'none';
                setScoreDisplay.classList.add('pro-set-score');
            } else {
                gameScoreDisplay.textContent = score.games;
                gameScoreDisplay.style.display = 'block';
                setScoreDisplay.classList.remove('pro-set-score');
            }
        } else {
            let setScores = score.sets;
            if (setScores) {
                setScores += ` ${score.games}`;
            } else {
                setScores = score.games;
            }
            setScoreDisplay.textContent = setScores;
            gameScoreDisplay.textContent = score.points;
            setScoreDisplay.classList.remove('pro-set-score');
            gameScoreDisplay.style.display = 'block';
        }

        if (score.server && score.server !== match.server) {
            match.server = score.server;
            updateServeButtons();
            updateServerIndicators();
            saveMatches();
        }
    }

    /**
     * Updates the serve buttons based on the current server.
     */
    function updateServeButtons() {
        const playerServerOnlyButtons = document.querySelectorAll('#player-points .server-only');
        const opponentServerOnlyButtons = document.querySelectorAll('#opponent-points .server-only');

        if (match.server === 'player') {
            playerServerOnlyButtons.forEach(btn => btn.style.display = 'block');
            opponentServerOnlyButtons.forEach(btn => btn.style.display = 'none');
        } else if (match.server === 'opponent') {
            playerServerOnlyButtons.forEach(btn => btn.style.display = 'none');
            opponentServerOnlyButtons.forEach(btn => btn.style.display = 'block');
        }
    }

    /**
     * Updates the server indicators based on the current server.
     */
    function updateServerIndicators() {
        if (match.server === 'player') {
            playerServerIndicator.style.display = 'inline';
            opponentServerIndicator.style.display = 'none';
        } else if (match.server === 'opponent') {
            playerServerIndicator.style.display = 'none';
            opponentServerIndicator.style.display = 'inline';
        }
    }

    /**
     * Saves the match data to local or session storage.
     */
    function saveMatches() {
        if (match.completed) {
            let matches = JSON.parse(localStorage.getItem('matches')) || [];
            const existingMatchIndex = matches.findIndex(m => m.id === match.id);
            if (existingMatchIndex > -1) {
                matches[existingMatchIndex] = match;
            } else {
                matches.push(match);
            }
            localStorage.setItem('matches', JSON.stringify(matches));
            sessionStorage.removeItem('activeMatch');
        } else {
            sessionStorage.setItem('activeMatch', JSON.stringify(match));
        }
    }
});
