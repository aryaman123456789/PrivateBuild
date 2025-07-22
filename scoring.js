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
        const playerWonPoint = (point.player === 'player' && (point.outcome === 'winner' || point.outcome === 'ace')) || (point.player === 'opponent' && (point.outcome === 'unforced-error' || point.outcome === 'double-fault' || point.outcome === 'forced-error'));

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

        if ((playerGames >= 6 && playerGames >= opponentGames + 2) || (format === 'pro-set-8-games' && playerGames === 8)) {
            playerSets++;
            playerGames = 0;
            opponentGames = 0;
        } else if ((opponentGames >= 6 && opponentGames >= playerGames + 2) || (format === 'pro-set-8-games' && opponentGames === 8)) {
            opponentSets++;
            playerGames = 0;
            opponentGames = 0;
        } else if (playerGames === 6 && opponentGames === 6 && format !== 'best-of-three-full-sets') {
            isTiebreak = true;
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
            if (currentServer === 'player') {
                pointsString = `${pointValues[playerPoints]}-${pointValues[opponentPoints]}`;
            } else {
                pointsString = `${pointValues[opponentPoints]}-${pointValues[playerPoints]}`;
            }
        }
    }

    return {
        sets: `${playerSets}-${opponentSets}`,
        games: `${playerGames}-${opponentGames}`,
        points: pointsString
    };
}
