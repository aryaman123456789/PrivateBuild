document.addEventListener('DOMContentLoaded', () => {
    const newMatchBtn = document.getElementById('new-match-btn');
    const matchList = document.getElementById('match-list');

    displayMatches();

    function displayMatches() {
        matchList.innerHTML = '';
        const activeMatch = JSON.parse(sessionStorage.getItem('activeMatch'));
        if (activeMatch) {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <a href="match.html?id=${activeMatch.id}">
                    <strong>Resume Match:</strong> Opponent: ${activeMatch.opponentName}
                </a>
            `;
            matchList.appendChild(listItem);
        }

        const matches = JSON.parse(localStorage.getItem('matches')) || [];
        matches.filter(m => m.completed).forEach((match, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <a href="match-stats.html?id=${match.id}">
                    <span>Opponent: ${match.opponentName}, Score: ${match.finalScore}</span>
                </a>
                <button class="delete-btn" data-index="${index}">Delete</button>
            `;
            matchList.appendChild(listItem);
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                deleteMatch(index);
            });
        });
    }

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
