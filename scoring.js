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

            const isMatchTiebreak = format === 'best-of-three-tiebreak' && playerSets === 1 && opponentSets === 1;
            const tiebreakPointsToWin = isMatchTiebreak ? (format.includes('4-game') ? 7 : 10) : 7;

            const playerWinsTiebreak = playerPoints >= tiebreakPointsToWin && playerPoints >= opponentPoints + 2;
            const opponentWinsTiebreak = opponentPoints >= tiebreakPointsToWin && opponentPoints >= playerPoints + 2;

            if (playerWinsTiebreak || opponentWinsTiebreak) {
                if (playerWinsTiebreak) {
                    playerGames++;
                    tiebreakLoserScore = opponentPoints;
                } else {
                    opponentGames++;
                    tiebreakLoserScore = playerPoints;
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
            } else if (playerGames >= 8 && playerGames >= opponentGames + 2) {
                playerSets++;
            } else if (opponentGames >= 8 && opponentGames >= playerGames + 2) {
                opponentSets++;
            }
        } else {
            const gamesToWin = format.includes('4-game') ? 4 : 6;
            const playerWonSet = playerGames >= gamesToWin && playerGames >= opponentGames + 2;
            const opponentWonSet = opponentGames >= gamesToWin && opponentGames >= playerGames + 2;

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
            } else if (playerGames === gamesToWin && opponentGames === gamesToWin && format !== 'best-of-three-full-sets') {
                isTiebreak = true;
            }
        }
    }

    const setsToWin = format.includes('best-of-three') ? 2 : 1;
    if (playerSets >= setsToWin || opponentSets >= setsToWin) {
        const winner = playerSets >= setsToWin ? "Player" : "Opponent";
        return { sets: `Match Over: ${winner} Wins!`, games: "", points: "" };
    }

    if (format === 'pro-set-8-games') {
        return {
            sets: `${playerGames}-${opponentGames}`,
            games: isTiebreak ? `${playerPoints}-${opponentPoints}` : `${pointValues[playerPoints]}-${pointValues[opponentPoints]}`,
            points: '',
            server: currentServer
        };
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
            } else {
                const serverHasAdvantage = (currentServer === 'player' && playerPoints > opponentPoints) || (currentServer === 'opponent' && opponentPoints > playerPoints);
                if (serverHasAdvantage) {
                    pointsString = 'Ad-In';
                } else {
                    pointsString = 'Ad-Out';
                }
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
