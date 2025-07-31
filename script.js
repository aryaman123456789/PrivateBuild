/**
 * @file This file contains the main script for the application.
 * @author [Your Name]
 */

document.addEventListener('DOMContentLoaded', () => {
    const newMatchBtn = document.getElementById('new-match-btn');
    const matchList = document.getElementById('match-list');

    displayMatches();

    /**
     * Displays the list of matches.
     */
    function displayMatches() {
        matchList.innerHTML = '';
        const activeMatch = JSON.parse(sessionStorage.getItem('activeMatch'));
        if (activeMatch) {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <a href="match.html?id=${activeMatch.id}" class="match-link">
                    <strong>Resume Match:</strong> Opponent: ${activeMatch.opponentName}
                </a>
                <button class="delete-btn" data-active="true">Delete</button>
            `;
            matchList.appendChild(listItem);
        }

        const matches = JSON.parse(localStorage.getItem('matches')) || [];
        matches.filter(m => m.completed).forEach((match, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <a href="match-stats.html?id=${match.id}" class="match-link">
                    <span>Opponent: ${match.opponentName}, Score: ${match.finalScore}</span>
                </a>
                <button class="delete-btn" data-index="${index}">Delete</button>
            `;
            matchList.appendChild(listItem);
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                if (e.target.dataset.active) {
                    sessionStorage.removeItem('activeMatch');
                    displayMatches();
                } else {
                    const index = e.target.dataset.index;
                    deleteMatch(index);
                }
            });
        });
    }

    /**
     * Deletes a match from local storage.
     * @param {number} index - The index of the match to delete.
     */
    function deleteMatch(index) {
        let matches = JSON.parse(localStorage.getItem('matches')) || [];
        matches.splice(index, 1);
        localStorage.setItem('matches', JSON.stringify(matches));
        displayMatches();
    }

    newMatchBtn.addEventListener('click', () => {
        window.location.href = 'new-match.html';
    });
});
