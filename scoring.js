function calculateScore(points, format, scoringType, server) {
    let playerPoints = 0;
    let opponentPoints = 0;
    let playerGames = 0;
    let opponentGames = 0;
    let playerSets = 0;
    let opponentSets = 0;
    let currentServer = server;
    let isTiebreak = false;

    const pointValues = ['0', '15', '30', '40'];

    for (const point of points) {
        const playerWonPoint = (point.player === 'player' && point.outcome.includes('winner')) ||
                               (point.player === 'player' && point.outcome === 'ace') ||
                               (point.player === 'opponent' && point.outcome.includes('unforced')) ||
                               (point.player === 'opponent' && point.outcome.includes('forced')) ||
                               (point.player === 'opponent' && point.outcome === 'double-fault');

        if (isTiebreak) {
            if (playerWonPoint) {
                playerPoints++;
            } else {
                opponentPoints++;
            }

            if ((playerPoints >= 7 && playerPoints >= opponentPoints + 2) || (format === 'best-of-three-tiebreak' && playerPoints === 10)) {
                playerGames++;
                playerPoints = 0;
                opponentPoints = 0;
                isTiebreak = false;
            } else if ((opponentPoints >= 7 && opponentPoints >= playerPoints + 2) || (format === 'best-of-three-tiebreak' && opponentPoints === 10)) {
                opponentGames++;
                playerPoints = 0;
                opponentPoints = 0;
                isTiebreak = false;
            }

        } else {
            if (playerWonPoint) {
                playerPoints++;
            } else {
                opponentPoints++;
            }

            if (playerPoints >= 4 && playerPoints >= opponentPoints + 2) {
                playerGames++;
                playerPoints = 0;
                opponentPoints = 0;
                currentServer = currentServer === 'player' ? 'opponent' : 'player';
            } else if (opponentPoints >= 4 && opponentPoints >= playerPoints + 2) {
                opponentGames++;
                playerPoints = 0;
                opponentPoints = 0;
                currentServer = currentServer === 'player' ? 'opponent' : 'player';
            } else if (scoringType === 'no-ad' && playerPoints === 4 && opponentPoints === 4) {
                if (playerWonPoint) {
                    playerGames++;
                } else {
                    opponentGames++;
                }
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
                playerGames = 0;
                opponentGames = 0;
            } else if (opponentGames >= 8 && opponentGames >= playerGames + 2) {
                opponentSets++;
                playerGames = 0;
                opponentGames = 0;
            }
        } else { 
            const gamesToWin = format.includes('4-game') ? 4 : 6;
            if (playerGames >= gamesToWin && playerGames >= opponentGames + 2) {
                playerSets++;
                playerGames = 0;
                opponentGames = 0;
            } else if (opponentGames >= gamesToWin && opponentGames >= playerGames + 2) {
                opponentSets++;
                playerGames = 0;
                opponentGames = 0;
            } else if (playerGames === gamesToWin && opponentGames === gamesToWin && format !== 'best-of-three-full-sets') {
                isTiebreak = true;
            }
        }
    }

    const setsToWin = format.includes('best-of-three') ? 2 : 1;
    if (playerSets >= setsToWin) {
        return { sets: "Match Over: Player Wins!", games: "", points: "" };
    } else if (opponentSets >= setsToWin) {
        return { sets: "Match Over: Opponent Wins!", games: "", points: "" };
    }

    let pointsString = '';
    if (isTiebreak) {
        pointsString = `${playerPoints}-${opponentPoints}`;
    } else {
        if (scoringType === 'ad' && playerPoints >= 3 && opponentPoints >= 3) {
            if (playerPoints === opponentPoints) {
                pointsString = 'Deuce';
            } else if (playerPoints > opponentPoints) {
                pointsString = 'Ad-In';
            } else {
                pointsString = 'Ad-Out';
            }
        } else {
            pointsString = `${pointValues[playerPoints]}-${pointValues[opponentPoints]}`;
        }
    }

    return {
        sets: `${playerSets}-${opponentSets}`,
        games: `${playerGames}-${opponentGames}`,
        points: pointsString,
        server: currentServer
    };
}
