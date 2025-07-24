# Tennis Match Tracker

This is a simple web application for tracking tennis matches. It allows you to record the outcome of each point and keeps track of the score.

## Features

- **Create and Manage Matches:** Create new matches with details like opponent, date, location, and match format.
- **Match History:** View a history of all your past matches.
- **Delete Matches:** Delete matches from your history.
- **Point-by-Point Tracking:** Record the outcome of each point (winner, ace, forced error, unforced error, double fault) for both players.
- **Automatic Scoring:** The application automatically calculates and displays the score based on the rules of tennis.
- **Ad/No-Ad Scoring:** Choose between "Ad" and "No-Ad" scoring for each match.
- **Server Tracking:** The application tracks who is serving and adjusts the available point-tracking options accordingly.
- **Undo:** Undo the last point if you make a mistake.
- **Local Storage:** All match data is saved in your browser's local storage, so you can close the application and resume later.
- **Completed Match Stats:** View detailed statistics for completed matches, including aces, double faults, serve percentages, and more.
- **Resume In-Progress Matches:** If you leave a match before it's finished, you can easily resume it from the main page.

## How to Use

1.  Open the `index.html` file in your web browser.
2.  To create a new match, click the "Create New Match" button and fill out the form.
3.  Once you start a match, you will be prompted to select who is serving first.
4.  Use the buttons to record the outcome of each point.
5.  The score will be updated automatically.
6.  When a match is completed, it will be saved to the main page. Click on it to view the match statistics.
7.  If you have a match in progress, a "Resume Match" link will appear on the main page.

## Future Improvements

-   Ability to share match results.
-   User accounts and cloud storage.
