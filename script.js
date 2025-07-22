document.addEventListener('DOMContentLoaded', () => {
    const newMatchBtn = document.getElementById('new-match-btn');
    const matchList = document.getElementById('match-list');

    // Load match history from local storage
    const matches = JSON.parse(localStorage.getItem('matches')) || [];

    displayMatches();

    function displayMatches() {
        matchList.innerHTML = '';
        const matches = JSON.parse(localStorage.getItem('matches')) || [];
        matches.forEach((match, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span>Opponent: ${match.opponentName}, Date: ${match.date}, Location: ${match.location}</span>
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
