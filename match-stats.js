document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('id');
    const matches = JSON.parse(localStorage.getItem('matches')) || [];
    const match = matches.find(m => m.id === matchId);

    if (match) {
        const playerName = "Player"; // You can replace this with actual player name if available
        const opponentName = match.opponentName;

        document.getElementById('player-name').textContent = playerName;
        document.getElementById('opponent-name').textContent = opponentName;

        const stats = calculateAllStatistics(match);
        
        const playerStatsData = document.getElementById('player-stats-data');
        const opponentStatsData = document.getElementById('opponent-stats-data');
        const statsLabelsData = document.getElementById('stats-labels-data');

        const statOrder = [
            'Aces', 'Double Faults', 'First Serve %', 'Win % on 1st Serve', 'Win % on 2nd Serve',
            'Break Points Won', 'Tiebreaks Won', 'Receiving Points Won', 'Points Won', 'Games Won',
            'Max Games Won in a Row', 'Max Points Won in a Row', 'Service Points Won', 'Service Games Won'
        ];

        statOrder.forEach(statName => {
            const playerStatValue = stats.player[statName] || 0;
            const opponentStatValue = stats.opponent[statName] || 0;

            const playerStatElement = document.createElement('div');
            playerStatElement.textContent = playerStatValue;
            playerStatsData.appendChild(playerStatElement);

            const opponentStatElement = document.createElement('div');
            opponentStatElement.textContent = opponentStatValue;
            opponentStatsData.appendChild(opponentStatElement);

            const labelElement = document.createElement('div');
            labelElement.textContent = statName;
            statsLabelsData.appendChild(labelElement);
        });

    } else {
        console.error('Match not found.');
        window.location.href = 'index.html';
    }
});

function calculateAllStatistics(match) {
    const { points, format, scoring, initialServer } = match;
    let playerStats = {
        'Aces': 0, 'Double Faults': 0, 'First Serves In': 0, 'First Serves Total': 0,
        'Second Serves In': 0, 'Second Serves Total': 0, 'First Serve Points Won': 0,
        'Second Serve Points Won': 0, 'Break Points Saved': 0, 'Break Points Faced': 0,
        'Break Points Won': 0, 'Break Points Opportunities': 0, 'Receiving Points Won': 0,
        'Total Points Won': 0, 'Games Won': 0, 'Tiebreaks Won': 0, 'Max Games Won in a Row': 0,
        'Max Points Won in a Row': 0, 'Service Points Won': 0, 'Service Games Won': 0
    };
    let opponentStats = {
        'Aces': 0, 'Double Faults': 0, 'First Serves In': 0, 'First Serves Total': 0,
        'Second Serves In': 0, 'Second Serves Total': 0, 'First Serve Points Won': 0,
        'Second Serve Points Won': 0, 'Break Points Saved': 0, 'Break Points Faced': 0,
        'Break Points Won': 0, 'Break Points Opportunities': 0, 'Receiving Points Won': 0,
        'Total Points Won': 0, 'Games Won': 0, 'Tiebreaks Won': 0, 'Max Games Won in a Row': 0,
        'Max Points Won in a Row': 0, 'Service Points Won': 0, 'Service Games Won': 0
    };

    let server = initialServer;
    let playerPointsInRow = 0;
    let opponentPointsInRow = 0;
    let playerGamesInRow = 0;
    let opponentGamesInRow = 0;

    let lastPlayerGames = 0;
    let lastOpponentGames = 0;

    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const playerWon = (point.player === 'player' && (point.outcome.includes('winner') || point.outcome === 'ace')) || (point.player === 'opponent' && (point.outcome.includes('unforced') || point.outcome.includes('forced') || point.outcome === 'double-fault'));

        // Point outcome stats
        if (point.player === 'player') {
            if (point.outcome === 'ace') playerStats['Aces']++;
        } else {
            if (point.outcome === 'double-fault') opponentStats['Double Faults']++;
        }

        // Service stats
        if (server === 'player') {
            playerStats['First Serves Total']++; // Simplified
            if (point.outcome !== 'double-fault') {
                playerStats['First Serves In']++;
                if (playerWon) playerStats['First Serve Points Won']++;
            } else {
                playerStats['Double Faults']++;
            }
        } else {
            opponentStats['First Serves Total']++; // Simplified
            if (point.outcome !== 'double-fault') {
                opponentStats['First Serves In']++;
                if (!playerWon) opponentStats['First Serve Points Won']++;
            } else {
                opponentStats['Double Faults']++;
            }
        }

        if (playerWon) {
            playerStats['Total Points Won']++;
            playerPointsInRow++;
            opponentPointsInRow = 0;
            if (server === 'player') playerStats['Service Points Won']++;
            else playerStats['Receiving Points Won']++;
        } else {
            opponentStats['Total Points Won']++;
            opponentPointsInRow++;
            playerPointsInRow = 0;
            if (server === 'opponent') opponentStats['Service Points Won']++;
            else opponentStats['Receiving Points Won']++;
        }
        
        playerStats['Max Points Won in a Row'] = Math.max(playerStats['Max Points Won in a Row'], playerPointsInRow);
        opponentStats['Max Points Won in a Row'] = Math.max(opponentStats['Max Points Won in a Row'], opponentPointsInRow);

        const score = calculateScore(points.slice(0, i + 1), format, scoring, initialServer);
        const currentGames = score.games.split('-').map(Number);
        const playerGames = isNaN(currentGames[0]) ? lastPlayerGames : currentGames[0];
        const opponentGames = isNaN(currentGames[1]) ? lastOpponentGames : currentGames[1];

        if (playerGames > lastPlayerGames) {
            playerGamesInRow++;
            opponentGamesInRow = 0;
            if(server === 'player') playerStats['Service Games Won']++;
        } else if (opponentGames > lastOpponentGames) {
            opponentGamesInRow++;
            playerGamesInRow = 0;
            if(server === 'opponent') opponentStats['Service Games Won']++;
        }
        
        playerStats['Max Games Won in a Row'] = Math.max(playerStats['Max Games Won in a Row'], playerGamesInRow);
        opponentStats['Max Games Won in a Row'] = Math.max(opponentStats['Max Games Won in a Row'], opponentGamesInRow);

        lastPlayerGames = playerGames;
        lastOpponentGames = opponentGames;

        if (score.server !== server) {
            server = score.server;
        }
    }

    const finalScore = calculateScore(points, format, scoring, initialServer);
    if (finalScore.isMatchOver) {
        const sets = finalScore.finalScore.split(' ');
        let playerTotalGames = 0;
        let opponentTotalGames = 0;
        sets.forEach(set => {
            const games = set.split('(')[0].split('-').map(Number);
            playerTotalGames += games[0];
            opponentTotalGames += games[1];
            if(set.includes('(')) {
                if(games[0] > games[1]) playerStats['Tiebreaks Won']++;
                else opponentStats['Tiebreaks Won']++;
            }
        });
        playerStats['Games Won'] = playerTotalGames;
        opponentStats['Games Won'] = opponentTotalGames;
    }


    playerStats['First Serve %'] = playerStats['First Serves Total'] > 0 ? `${Math.round((playerStats['First Serves In'] / playerStats['First Serves Total']) * 100)}%` : '0%';
    opponentStats['First Serve %'] = opponentStats['First Serves Total'] > 0 ? `${Math.round((opponentStats['First Serves In'] / opponentStats['First Serves Total']) * 100)}%` : '0%';
    playerStats['Win % on 1st Serve'] = playerStats['First Serves In'] > 0 ? `${Math.round((playerStats['First Serve Points Won'] / playerStats['First Serves In']) * 100)}%` : '0%';
    opponentStats['Win % on 1st Serve'] = opponentStats['First Serves In'] > 0 ? `${Math.round((opponentStats['First Serve Points Won'] / opponentStats['First Serves In']) * 100)}%` : '0%';
    playerStats['Win % on 2nd Serve'] = playerStats['Second Serves Total'] > 0 ? `${Math.round((playerStats['Second Serve Points Won'] / playerStats['Second Serves Total']) * 100)}%` : '0%';
    opponentStats['Win % on 2nd Serve'] = opponentStats['Second Serves Total'] > 0 ? `${Math.round((opponentStats['Second Serve Points Won'] / opponentStats['Second Serves Total']) * 100)}%` : '0%';
    playerStats['Break Points Won'] = playerStats['Break Points Opportunities'] > 0 ? `${playerStats['Break Points Won']}/${playerStats['Break Points Opportunities']}` : '0/0';
    opponentStats['Break Points Won'] = opponentStats['Break Points Opportunities'] > 0 ? `${opponentStats['Break Points Won']}/${opponentStats['Break Points Opportunities']}` : '0/0';
    playerStats['Points Won'] = playerStats['Total Points Won'];
    opponentStats['Points Won'] = opponentStats['Total Points Won'];

    return { player: playerStats, opponent: opponentStats };
}
