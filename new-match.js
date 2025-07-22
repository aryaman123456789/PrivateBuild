document.addEventListener('DOMContentLoaded', () => {
    const newMatchForm = document.getElementById('new-match-form');

    newMatchForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newMatch = {
            opponentName: document.getElementById('opponent-name').value,
            date: document.getElementById('match-date').value,
            location: document.getElementById('match-location').value,
            type: document.getElementById('match-type').value,
            format: document.getElementById('match-format').value,
            scoring: document.getElementById('scoring-type').value,
            id: Date.now().toString(), // Simple unique ID
            points: []
        };

        // Save the new match to local storage
        const matches = JSON.parse(localStorage.getItem('matches')) || [];
        matches.push(newMatch);
        localStorage.setItem('matches', JSON.stringify(matches));

        // Redirect to the match page (which we'll create next)
        window.location.href = `match.html?id=${newMatch.id}`;
    });
});
