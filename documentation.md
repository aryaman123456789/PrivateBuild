# Tennis Match Tracker Documentation

This document provides an overview of the HTML files in the Tennis Match Tracker application.

## Project Overview

The Tennis Match Tracker is a web application designed to help tennis players track their matches. It allows users to create new matches, record points, and view detailed statistics for completed matches. The application uses HTML, CSS, and JavaScript, and stores data in the browser's local storage.

---

## `index.html`

### Purpose

This is the main page of the application. It serves as the entry point and displays a history of all past and in-progress matches.

### Key Elements

-   **`<header>`**: Contains the main title of the application, "Tennis Match Tracker".
-   **`<section id="match-history">`**: This section displays a list of all matches.
    -   **`<ul id="match-list">`**: The match history is dynamically populated here by `script.js`. Each list item represents a match and is clickable to view stats.
-   **`<section id="new-match">`**:
    -   **`<button id="new-match-btn">`**: A button that navigates the user to `new-match.html` to create a new match.

### Associated Scripts

-   `script.js`: Handles the logic for displaying the match history and navigating to other pages.

---

## `new-match.html`

### Purpose

This page contains a form for creating a new tennis match. Users can input various details about the match before starting.

### Key Elements

-   **`<form id="new-match-form">`**: The main form for creating a new match. It includes the following fields:
    -   **`#opponent-name`**: Text input for the opponent's name.
    -   **`#match-date`**: Date input for the match date.
    -   **`#match-location`**: Text input for the match location.
    -   **`#match-type`**: A dropdown to select between "Singles" and "Doubles".
    -   **`#match-format`**: A dropdown to select the match format (e.g., "Best of three with 10 pt tiebreak").
    -   **`#scoring-type`**: A dropdown to select the scoring type ("Ad" or "No-Ad").
    -   **`<button type="submit">`**: The button to submit the form and start the match.

### Associated Scripts

-   `new-match.js`: Handles the form submission, creates a new match object, saves it to local storage, and redirects the user to `match.html`.

---

## `match.html`

### Purpose

This is the core page of the application where users track a match point-by-point.

### Key Elements

-   **`<section id="score-display">`**:
    -   **`<h1 id="set-score">`**: Displays the current set score.
    -   **`<h2 id="game-score">`**: Displays the current game score.
-   **`<section id="server-selection">`**: This section is shown at the beginning of a match to determine the first server.
-   **`<section id="point-tracking">`**: This is the main section for point tracking. It is divided into two columns, one for each player.
    -   **Player Columns**: Each column contains buttons to record different outcomes for a point:
        -   **Server-specific buttons**: "Ace", "Fault".
        -   **Shot type columns**: "Winners", "Forced Errors", "Unforced Errors", with buttons for "Forehand", "Backhand", and "Volley".
-   **`<button id="undo-btn">`**: Allows the user to undo the last recorded point.

### Associated Scripts

-   `scoring.js`: Contains the core logic for scoring the match, including handling points, games, sets, and tiebreaks.
-   `match.js`: Handles the user interactions on the page, such as button clicks for point tracking, and updates the UI based on the state from `scoring.js`.

---

## `match-stats.html`

### Purpose

This page displays detailed statistics for a completed match.

### Key Elements

-   **`<section id="match-stats-container">`**: The main container for the statistics, divided into three columns:
    -   **Player Columns (`.player-column-stats`)**: Two columns, one for each player, displaying their respective stats. The player names are dynamically set in `<h2 id="player-name">` and `<h2 id="opponent-name">`. The stats are populated in `<div id="player-stats-data">` and `<div id="opponent-stats-data">`.
    -   **Stats Labels Column (`.stats-labels-column`)**: Displays the labels for each stat (e.g., "Aces", "Double Faults").
-   **`<section id="ai-analysis-container">`**:
    -   **`<h2>AI Coach Analysis</h2>`**: A section intended for future AI-powered analysis of the match.
-   **`<a href="index.html" class="btn top-right-link">`**: A link to go back to the main page.

### Associated Scripts

-   `scoring.js`: Used to access scoring logic if needed, though `match-stats.js` is the primary script.
-   `match-stats.js`: Retrieves the data for the completed match from local storage and dynamically populates the statistics on the page.
