/**
 * @file This file contains the logic for displaying match statistics.
 * @author [Your Name]
 */

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
            'Winners', 'Forehand Winners', 'Backhand Winners', 'Volley Winners',
            'Unforced Errors', 'Forehand Unforced', 'Backhand Unforced', 'Volley Unforced',
            'Forced Errors', 'Forehand Forced', 'Backhand Forced', 'Volley Forced',
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

        getAIAnalysis(match.points, stats).then(aiAnalysis => {
            document.getElementById('ai-went-well').textContent = aiAnalysis.wentWell;
            document.getElementById('ai-did-not-go-well').textContent = aiAnalysis.didNotGoWell;
            document.getElementById('ai-tips').textContent = aiAnalysis.tips;
        });

    } else {
        console.error('Match not found.');
        window.location.href = 'index.html';
    }
});

/**
 * Fetches AI analysis for the match.
 * @param {Array} points - The points played in the match.
 * @param {Object} stats - The match statistics.
 * @returns {Promise<Object>} A promise that resolves to the AI analysis.
 */
async function getAIAnalysis(points, stats) {
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ points, stats })
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error fetching AI analysis:", errorText);
            return {
                wentWell: "Error fetching analysis.",
                didNotGoWell: "Error fetching analysis.",
                tips: "Error fetching analysis."
            };
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching AI analysis:", error);
        return {
            wentWell: "Error fetching analysis.",
            didNotGoWell: "Error fetching analysis.",
            tips: "Error fetching analysis."
        };
    }
}

/**
 * Gets the server for each point in the match.
 * @param {Array} points - The points played in the match.
 * @param {string} format - The match format.
 * @param {string} scoring - The scoring system.
 * @param {string} initialServer - The initial server.
 * @returns {Array} An array of servers for each point.
 */
function getServersPerPoint(points, format, scoring, initialServer) {
    const servers = [];
    let server = initialServer;
    const filteredPoints = points.filter(p => p.outcome !== 'fault');
    for (let i = 0; i < filteredPoints.length; i++) {
        servers.push(server);
        const score = calculateScore(filteredPoints.slice(0, i + 1), format, scoring, initialServer);
        server = score.server;
    }
    return servers;
}

/**
 * Calculates all statistics for a match.
 * @param {Object} match - The match object.
 * @returns {Object} An object containing player and opponent statistics.
 */
function calculateAllStatistics(match) {
    const { points, format, scoring, initialServer } = match;
    let playerStats = {
        'Aces': 0, 'Double Faults': 0, 'First Serves In': 0, 'First Serves Total': 0,
        'Second Serves In': 0, 'Second Serves Total': 0, 'First Serve Points Won': 0,
        'Second Serve Points Won': 0, 'Break Points Saved': 0, 'Break Points Faced': 0,
        'Break Points Won': 0, 'Break Points Opportunities': 0, 'Receiving Points Won': 0,
        'Total Points Won': 0, 'Games Won': 0, 'Tiebreaks Won': 0, 'Max Games Won in a Row': 0,
        'Max Points Won in a Row': 0, 'Service Points Won': 0, 'Service Games Won': 0,
        'Winners': 0, 'Forehand Winners': 0, 'Backhand Winners': 0, 'Volley Winners': 0,
        'Unforced Errors': 0, 'Forehand Unforced': 0, 'Backhand Unforced': 0, 'Volley Unforced': 0,
        'Forced Errors': 0, 'Forehand Forced': 0, 'Backhand Forced': 0, 'Volley Forced': 0
    };
    let opponentStats = {
        'Aces': 0, 'Double Faults': 0, 'First Serves In': 0, 'First Serves Total': 0,
        'Second Serves In': 0, 'Second Serves Total': 0, 'First Serve Points Won': 0,
        'Second Serve Points Won': 0, 'Break Points Saved': 0, 'Break Points Faced': 0,
        'Break Points Won': 0, 'Break Points Opportunities': 0, 'Receiving Points Won': 0,
        'Total Points Won': 0, 'Games Won': 0, 'Tiebreaks Won': 0, 'Max Games Won in a Row': 0,
        'Max Points Won in a Row': 0, 'Service Points Won': 0, 'Service Games Won': 0,
        'Winners': 0, 'Forehand Winners': 0, 'Backhand Winners': 0, 'Volley Winners': 0,
        'Unforced Errors': 0, 'Forehand Unforced': 0, 'Backhand Unforced': 0, 'Volley Unforced': 0,
        'Forced Errors': 0, 'Forehand Forced': 0, 'Backhand Forced': 0, 'Volley Forced': 0
    };

    const servers = getServersPerPoint(points, format, scoring, initialServer);
    let serverIndex = 0;

    let playerPointsInRow = 0;
    let opponentPointsInRow = 0;
    let playerGamesInRow = 0;
    let opponentGamesInRow = 0;

    let lastPlayerGames = 0;
    let lastOpponentGames = 0;
    
    let isSecondServe = false;
    for (let i = 0; i < points.length; i++) {
        const point = points[i];

        if (point.outcome === 'fault') {
            isSecondServe = true;
            continue;
        }

        const server = servers[serverIndex];
        const playerWon = (point.player === 'player' && (point.outcome.includes('winner') || point.outcome === 'ace')) || (point.player === 'opponent' && (point.outcome.includes('unforced') || point.outcome.includes('forced') || point.outcome === 'double-fault'));
        const currentServerStats = server === 'player' ? playerStats : opponentStats;
        const pointPlayerStats = point.player === 'player' ? playerStats : opponentStats;

        if (point.outcome.includes('winner')) {
            pointPlayerStats['Winners']++;
            if (point.outcome.startsWith('fh')) pointPlayerStats['Forehand Winners']++;
            else if (point.outcome.startsWith('bh')) pointPlayerStats['Backhand Winners']++;
            else if (point.outcome.startsWith('v')) pointPlayerStats['Volley Winners']++;
        } else if (point.outcome.includes('unforced')) {
            pointPlayerStats['Unforced Errors']++;
            if (point.outcome.startsWith('fh')) pointPlayerStats['Forehand Unforced']++;
            else if (point.outcome.startsWith('bh')) pointPlayerStats['Backhand Unforced']++;
            else if (point.outcome.startsWith('v')) pointPlayerStats['Volley Unforced']++;
        } else if (point.outcome.includes('forced')) {
            pointPlayerStats['Forced Errors']++;
            if (point.outcome.startsWith('fh')) pointPlayerStats['Forehand Forced']++;
            else if (point.outcome.startsWith('bh')) pointPlayerStats['Backhand Forced']++;
            else if (point.outcome.startsWith('v')) pointPlayerStats['Volley Forced']++;
        }

        if (isSecondServe) {
            currentServerStats['Second Serves Total']++;
            if (point.outcome === 'double-fault') {
                currentServerStats['Double Faults']++;
            } else {
                currentServerStats['Second Serves In']++;
                if ((server === 'player' && playerWon) || (server === 'opponent' && !playerWon)) {
                    currentServerStats['Second Serve Points Won']++;
                }
            }
        } else {
            currentServerStats['First Serves Total']++;
            currentServerStats['First Serves In']++;
            if (point.outcome === 'ace') {
                currentServerStats['Aces']++;
            }
            if ((server === 'player' && playerWon) || (server === 'opponent' && !playerWon)) {
                currentServerStats['First Serve Points Won']++;
            }
        }

        isSecondServe = false;

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

        const score = calculateScore(points.filter(p => p.outcome !== 'fault').slice(0, serverIndex + 1), format, scoring, initialServer);
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
        serverIndex++;
    }

    const finalScore = calculateScore(points.filter(p => p.outcome !== 'fault'), format, scoring, initialServer);
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
    playerStats['Win % on 2nd Serve'] = playerStats['Second Serves In'] > 0 ? `${Math.round((playerStats['Second Serve Points Won'] / playerStats['Second Serves In']) * 100)}%` : '0%';
    opponentStats['Win % on 2nd Serve'] = opponentStats['Second Serves In'] > 0 ? `${Math.round((opponentStats['Second Serve Points Won'] / opponentStats['Second Serves In']) * 100)}%` : '0%';
    playerStats['Break Points Won'] = playerStats['Break Points Opportunities'] > 0 ? `${playerStats['Break Points Won']}/${playerStats['Break Points Opportunities']}` : '0/0';
    opponentStats['Break Points Won'] = opponentStats['Break Points Opportunities'] > 0 ? `${opponentStats['Break Points Won']}/${opponentStats['Break Points Opportunities']}` : '0/0';
    playerStats['Points Won'] = playerStats['Total Points Won'];
    opponentStats['Points Won'] = opponentStats['Total Points Won'];

    for (const stat in playerStats) {
        if (typeof playerStats[stat] === 'number' && playerStats[stat] < 0) {
            playerStats[stat] = 0;
        }
    }
    for (const stat in opponentStats) {
        if (typeof opponentStats[stat] === 'number' && opponentStats[stat] < 0) {
            opponentStats[stat] = 0;
        }
    }

    return { player: playerStats, opponent: opponentStats };
}
