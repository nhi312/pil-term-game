# PIL Term Game

A multiple-choice game for learning Public International Law, one week at a time.

**Play it:** https://nhi312.github.io/pil-term-game/

## What's in it

- **Weeks 1, 2, 4, 6, 8, 9, 10**, plus a mixed deck of everything.
- **261 terms from Weeks 1–10** (154 of them from Weeks 1–8). Each time a term comes up it is asked in one of eight forms: term → meaning, meaning → term, like-I'm-5 → term, slide example → term, term → like-I'm-5, term → slide example, true/false (sometimes with another term's meaning swapped in) and matching pairs.
- **303 hand-written questions** (28–51 per week). Most are cases and scenarios where you decide which term, rule or principle applies, plus true/false, fill in the blank, odd one out, spot the difference and quick facts.
- **Often wrong**: every question you miss is saved with a tally of how often you missed it. Practise them all or week by week. A question leaves the list after you get it right twice in a row.

## How to play

- Pick a week or the mixed deck.
- Question style: **Mix it up** (alternates hand-written questions with term questions), **Cases & scenarios**, or **Terms, 8 forms**.
- Round length: 10, 20 or the whole week.
- After every answer you get the answer, the reason, a like-I'm-5 note and the slide reference.
- Keyboard: `1`–`4` to answer, `Enter` for next, `Esc` back to the start.

Progress and the Often wrong list are saved in your browser only.

## Files

- `index.html`, `styles.css`, `app.js`: the game (no build step)
- `data.js`: term bank (`t` term, `m` official meaning, `e` like-I'm-5, `x` slide example)
- `questions.js`, `cases.js`: hand-written questions (`k` kind, `q` question, `o` options, `a` answer index, `why`, `eli`, `ref`)
- `fixes.js`: rebalanced answer options so the right answer isn't simply the longest
