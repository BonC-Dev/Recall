# Recall

A simple flashcard website for creating decks, studying questions, and practicing the cards you missed.

## Description

Recall is a browser-based flashcard app made with HTML, CSS, and JavaScript. You can create and rename decks, add questions and answers, edit existing cards, and search through a deck. During a study round, you reveal each answer and mark whether you remembered it. Recall shows your results and lets you retry missed cards or shuffle the next round. Decks are saved in your browser, and JSON backup import and export let you keep another copy or transfer your decks between browsers. No account or backend server is required.

### Features

- Create, rename, and delete decks.
- Add, edit, delete, and search flashcards.
- Reveal answers and track correct or missed responses.
- View results and retry missed cards.
- Shuffle cards without changing their saved order.
- Save decks using browser local storage.
- Import and export JSON backups.
- Use keyboard shortcuts during study sessions.
- Use a responsive layout on different screen sizes.

### Screenshots
<img width="1287" height="897" alt="image" src="https://github.com/user-attachments/assets/0c1be09d-26ee-4019-8ff9-fdd6fee13013" />
## Getting Started

### Dependencies
- A modern web browser with JavaScript and local storage enabled lol.

### Installing

1. Download this repo using **Code -> Download ZIP** on GitHub.
2. Extract the ZIP into a folder on your computer.
3. Keep `index.html`, `styles.css`, and the `js` folder together.

No changes to the source files are needed.

### Executing the program

1. Open the project folder that you just downloaded (remember to extract)
2. Double-click `index.html` to open Recall in your browser.
3. Open the sample deck or create your own deck.
4. Add cards with a question and an answer.
5. Select **study deck** to begin practicing.

### Keyboard shortcuts

While studying, with focus outside a text field:

- `Space`: reveal the answer.
- `1`: mark the revealed answer as correct.
- `2`: mark the revealed answer as missed.

### Running tests

With Node.js installed, run this command from the project folder:

```sh
node tests/check.cjs
```

The tests cover deck and card validation, storage, study rounds, shuffle, retry, backups, and keyboard handling.

## Help

- **The page looks broken:** Extract the entire ZIP and keep the original folder structure.
- **A backup will not import:** Use a JSON backup exported by Recall. Invalid files are rejected with an error message.

Export a backup regularly if you want to keep a separate copy of your decks. More features coming soon!

## License

This project is licensed under the MIT License. See [LICENSE.md](LICENSE.md) for details.
