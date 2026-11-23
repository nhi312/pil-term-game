# PIL Term Game

A multiple-choice game for learning the terms and definitions from a Public International Law course, one week at a time.

**Play it:** https://nhi312.github.io/pil-term-game/

## How it works

- Pick a week (1, 2, 4, 6, 8, 9, 10) or the mixed deck of all 261 terms.
- Choose a question style: mixed, term → meaning, meaning → term, or "like I'm 5" → term.
- Choose a round length: 10, 20 or the whole week.
- After every answer you see the official meaning, the plain-English version and the example from the slides.
- At the end you get a list of the terms you missed and can retry just those.
- Keyboard: `1`–`4` to answer, `Enter` for the next question, `Esc` back to the start.

Progress is saved in your browser only.

## Files

- `index.html`, `styles.css`, `app.js`: the game (no build step)
- `data.js`: the term bank, one list per week (`t` term, `m` official meaning, `e` like-I'm-5 explanation, `x` slide example)
