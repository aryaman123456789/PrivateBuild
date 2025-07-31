/**
 * @file This file contains the logic for calculating the score of a tennis match.
 * @author [Your Name]
 */

/**
 * Calculates the score of a tennis match.
 * @param {Array} points - An array of points played in the match.
 * @param {string} format - The format of the match (e.g., 'best-of-three').
 * @param {string} scoringType - The type of scoring (e.g., 'ad', 'no-ad').
 * @param {string} server - The initial server of the match.
 * @returns {Object} An object containing the current score of the match.
 */
function calculateScore(points, format, scoringType, server) {
    let playerPoints = 0;
    let opponentPoints = 0;
    let playerGames = 0;
    let opponentGames = 0;
    let completedSets = [];
    let playerSets = 0;
    let opponentSets = 0;
    let currentServer = server;
    let isTiebreak = false;
    let tiebreakLoserScore = null;

    const pointValues = ['0', '15', '30', '40'];

    for (const point of points) {
        const playerWonPoint = (point.player === 'player' && point.outcome.includes('winner')) ||
                               (point.player === 'player' && point.outcome === 'ace') ||
                               (point.player === 'opponent' && point.outcome.includes('unforced')) ||
                               (point.player === 'opponent' && point.outcome.includes('forced')) ||
                               (point.player === 'opponent' && point.outcome === 'double-fault');

        if (isTiebreak) {
            const tiebreakInitialServer = currentServer;

            if (playerWonPoint) {
                playerPoints++;
            } else {
                opponentPoints++;
            }

            const isMatchTiebreak = format.includes('best-of-three') && format !== 'best-of-three-full-sets' && playerSets === 1 && opponentSets === 1;
            const tiebreakPointsToWin = (isMatchTiebreak && !format.includes('4-game')) ? 10 : 7;

            const playerWinsTiebreak = playerPoints >= tiebreakPointsToWin && playerPoints >= opponentPoints + 2;
            const opponentWinsTiebreak = opponentPoints >= tiebreakPointsToWin && opponentPoints >= playerPoints + 2;

            if (playerWinsTiebreak || opponentWinsTiebreak) {
                if (isMatchTiebreak) {
                    if (playerWinsTiebreak) {
                        playerSets++;
                    } else {
                        opponentSets++;
                    }
                    completedSets.push({ player: playerPoints, opponent: opponentPoints, tiebreak: null });
                } else {
                    if (playerWinsTiebreak) {
                        playerGames++;
                        tiebreakLoserScore = opponentPoints;
                    } else {
                        opponentGames++;
                        tiebreakLoserScore = playerPoints;
                    }
                }
                playerPoints = 0;
                opponentPoints = 0;
                isTiebreak = false;
                currentServer = tiebreakInitialServer === 'player' ? 'opponent' : 'player';
            } else {
                const totalTiebreakPoints = playerPoints + opponentPoints;
                if (totalTiebreakPoints > 0 && totalTiebreakPoints % 2 === 1) {
                    currentServer = currentServer === 'player' ? 'opponent' : 'player';
                }
            }
        } else {
            if (playerWonPoint) {
                playerPoints++;
            } else {
                opponentPoints++;
            }

            let gameWon = false;
            if (scoringType === 'ad') {
                if (playerPoints >= 4 && playerPoints >= opponentPoints + 2) {
                    playerGames++;
                    gameWon = true;
                } else if (opponentPoints >= 4 && opponentPoints >= playerPoints + 2) {
                    opponentGames++;
                    gameWon = true;
                }
            } else { // no-ad
                if (playerPoints >= 4) {
                    playerGames++;
                    gameWon = true;
                } else if (opponentPoints >= 4) {
                    opponentGames++;
                    gameWon = true;
                }
            }

            if (gameWon) {
                playerPoints = 0;
                opponentPoints = 0;
                currentServer = currentServer === 'player' ? 'opponent' : 'player';
            }
        }

        if (format === 'pro-set-8-games') {
            if (playerGames === 8 && opponentGames === 8) {
                isTiebreak = true;
            } else if ((playerGames >= 8 && playerGames >= opponentGames + 2) || (playerGames === 9 && opponentGames === 8)) {
                playerSets++;
            } else if ((opponentGames >= 8 && opponentGames >= playerGames + 2) || (opponentGames === 9 && playerGames === 8)) {
                opponentSets++;
            }
        } else {
            const gamesToWin = format.includes('4-game') ? 4 : 6;
            const playerWonSet = (playerGames >= gamesToWin && playerGames >= opponentGames + 2) || (playerGames === gamesToWin + 1 && opponentGames === gamesToWin);
            const opponentWonSet = (opponentGames >= gamesToWin && opponentGames >= playerGames + 2) || (opponentGames === gamesToWin + 1 && playerGames === gamesToWin);

            if (playerWonSet || opponentWonSet) {
                if (playerWonSet) {
                    playerSets++;
                } else {
                    opponentSets++;
                }
                completedSets.push({ player: playerGames, opponent: opponentGames, tiebreak: tiebreakLoserScore });
                playerGames = 0;
                opponentGames = 0;
                tiebreakLoserScore = null;

                if (format.includes('best-of-three') && format !== 'best-of-three-full-sets' && playerSets === 1 && opponentSets === 1) {
                    isTiebreak = true;
                }
            } else if (playerGames === gamesToWin && opponentGames === gamesToWin && format !== 'best-of-three-full-sets') {
                isTiebreak = true;
            }
        }
    }

    const isMatchTiebreakInProgress = format.includes('best-of-three') && format !== 'best-of-three-full-sets' && playerSets === 1 && opponentSets === 1 && isTiebreak;

    if (isMatchTiebreakInProgress) {
        let setsString = completedSets.map(set => {
            if (set.tiebreak !== null) {
                return `${set.player}-${set.opponent}(${set.tiebreak})`;
            }
            return `${set.player}-${set.opponent}`;
        }).join(' ');

        return {
            sets: setsString,
            games: `${playerPoints}-${opponentPoints}`,
            points: '',
            server: currentServer
        };
    }

    const setsToWin = format.includes('best-of-three') ? 2 : 1;
    if (playerSets >= setsToWin || opponentSets >= setsToWin) {
        const winner = playerSets >= setsToWin ? "player" : "opponent";
        let finalSetsString;
        if (format === 'pro-set-8-games') {
            if (tiebreakLoserScore !== null) {
                finalSetsString = `${playerGames}-${opponentGames}(${tiebreakLoserScore})`;
            } else {
                finalSetsString = `${playerGames}-${opponentGames}`;
            }
        } else {
            finalSetsString = completedSets.map(set => {
                if (set.tiebreak !== null) {
                    return `${set.player}-${set.opponent}(${set.tiebreak})`;
                }
                return `${set.player}-${set.opponent}`;
            }).join(' ');
        }
        
        if (playerGames > 0 || opponentGames > 0) {
            if(format !== 'pro-set-8-games')
             finalSetsString += ` ${playerGames}-${opponentGames}`;
        }

        return {
            isMatchOver: true,
            winner: winner,
            finalScore: finalSetsString,
            sets: `Match Over: ${winner} Wins! ${finalSetsString}`, 
            games: "", 
            points: "" 
        };
    }

    if (format === 'pro-set-8-games') {
        if (isTiebreak) {
            return {
                sets: `${playerGames}-${opponentGames} ${playerPoints}-${opponentPoints}`,
                games: '',
                points: '',
                server: currentServer,
                isTiebreak: true
            };
        } else {
            let gamesString;
            if (scoringType === 'ad' && playerPoints >= 3 && opponentPoints >= 3) {
                if (playerPoints === opponentPoints) {
                    gamesString = 'Deuce';
                } else if (playerPoints > opponentPoints) {
                    gamesString = (currentServer === 'player') ? 'Ad-In' : 'Ad-Out';
                } else {
                    gamesString = (currentServer === 'opponent') ? 'Ad-In' : 'Ad-Out';
                }
            } else {
                gamesString = `${pointValues[playerPoints]}-${pointValues[opponentPoints]}`;
            }
            return {
                sets: `${playerGames}-${opponentGames}`,
                games: gamesString,
                points: '',
                server: currentServer
            };
        }
    }

    let setsString = completedSets.map(set => {
        if (set.tiebreak !== null) {
            return `${set.player}-${set.opponent}(${set.tiebreak})`;
        }
        return `${set.player}-${set.opponent}`;
    }).join(' ');
    
    let pointsString = '';
    if (isTiebreak) {
        pointsString = `${playerPoints}-${opponentPoints}`;
    } else {
        if (scoringType === 'ad' && playerPoints >= 3 && opponentPoints >= 3) {
            if (playerPoints === opponentPoints) {
                pointsString = 'Deuce';
            } else if (playerPoints > opponentPoints) {
                pointsString = (currentServer === 'player') ? 'Ad-In' : 'Ad-Out';
            } else { // opponentPoints > playerPoints
                pointsString = (currentServer === 'opponent') ? 'Ad-In' : 'Ad-Out';
            }
        } else {
            pointsString = `${pointValues[playerPoints]}-${pointValues[opponentPoints]}`;
        }
    }

    return {
        sets: setsString,
        games: `${playerGames}-${opponentGames}`,
        points: pointsString,
        server: currentServer
    };
}

/**
 * Fetches AI analysis for the match from the server.
 * @param {Array} points - The points played in the match.
 * @param {Object} stats - The statistics of the match.
 * @returns {Promise<Object>} A promise that resolves with the AI analysis.
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
            throw new Error(`HTTP error! status: ${response.status}`);
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
