# 🌟 Brain Adventure

An interactive, browser-based educational game webapp designed for young children (ages 5–7) to practise **analytical thinking, reasoning, pattern recognition, memory, and maths** — all through colourful emoji-powered games.

No installation. No login. No server. Just open `index.html` in any browser and play.

🎮 **Live Demo:** [https://kumaralok444.github.io/-brain-adventure/](https://kumaralok444.github.io/-brain-adventure/)

---

## 📸 Screenshots

| Home Screen | Pattern Play | Maths Practice |
|:-----------:|:------------:|:--------------:|
| Pick from 6 games | Complete emoji patterns | Addition, subtraction & times tables |

---

## 🎮 Games

### 🎨 Pattern Play
Children are shown a repeating emoji sequence with the last item hidden as `❓` and must choose what comes next.

- Patterns are **algorithmically generated** every session — no two games are the same
- Uses 4 themed emoji pools: animals, food, nature, colours
- Pattern templates include AB, AABB, ABB, AAB, and ABC sequences
- Builds: **pattern recognition**, **logical prediction**, **visual reasoning**

---

### 🧠 Memory Match
A classic card-flip memory game with 16 cards (8 matching emoji pairs).

- Cards are shuffled randomly every game
- Tracks **number of moves** and **time taken**
- Personal best is saved (fewest moves wins)
- Builds: **working memory**, **concentration**, **spatial reasoning**

---

### 🔍 Odd One Out
Four items are shown — three belong to the same category and one does not. Children must find the odd one.

- **Algorithmically generated** — picks 3 items from one emoji category and 1 from a completely different category
- Categories include: animals, fruits, vehicles, flowers, sports, music instruments, sweets, nature
- Items are shuffled so the odd one is never always in the same position
- Builds: **categorisation**, **critical thinking**, **reasoning**

---

### 🔢 What's Next?
Children are shown a sequence of numbers or emojis and must identify what comes next.

- **55% number sequences** (count by 1s, 2s, 5s, 10s, descending, odd numbers) — all generated dynamically
- **45% emoji sequences** (moon phases, rainbow colours, growth stages, time of day, etc.)
- Builds: **number sense**, **sequential reasoning**, **pattern logic**

---

### ➕ Maths Practice
Fresh arithmetic questions every session, appropriate for ages 5–7.

- **Addition** — e.g. `6 + 7 = ?` (numbers 1–9)
- **Subtraction** — e.g. `9 − 4 = ?` (always positive answers)
- **×2 tables** — e.g. `5 × 2 = ?`
- **×3 tables** — e.g. `4 × 3 = ?`
- Wrong answer choices are plausible but clearly distinct
- Builds: **arithmetic fluency**, **number bonds**, **multiplication foundations**

---

### 🌍 Live Trivia Quiz
Powered by the free **Open Trivia DB API** — fetches 10 brand-new questions every single session.

- Categories rotate between: 🐾 Animals, 🌿 Nature, 💡 General Knowledge
- Easy difficulty, multiple-choice format
- Handles offline/API errors gracefully with a retry button
- Builds: **general knowledge**, **reading comprehension**, **quick thinking**

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 👤 **Player Profile** | Set your name and choose an avatar (10 animal emoji options) |
| ⚡ **XP System** | Earn XP after every game based on your score |
| 🏆 **Personal Bests** | Each game tracks your highest score / fewest moves |
| 🔥 **Daily Streak** | Tracks consecutive days played — shown as a fire banner |
| 📊 **Stats Screen** | Games played, average score, perfect games, total XP, recent history |
| 🕒 **Play History** | Last 50 games stored with score, XP earned, and timestamp |
| 🎉 **Confetti** | Fires on high scores and game completions |
| 🔊 **Sound Effects** | Ascending chime for correct, descending tone for wrong (Web Audio API) |
| ⏱ **Memory Timer** | Live timer in the Memory Match game |
| 📱 **Responsive** | Works on desktop, tablet, and mobile |
| 🌐 **Offline** | All games except Live Trivia work with no internet |

---

## 🗂 Project Structure

```
brain-adventure/
├── index.html          # All screens and HTML markup
├── css/
│   └── app.css         # All styles, animations, responsive layout
└── js/
    ├── data.js         # Emoji pools + all question generators (genPattern, genOdd, genSequence, genMath)
    ├── store.js        # Persistence layer — reads/writes JSON to localStorage
    ├── ui.js           # Rendering helpers, modals, confetti, sound, result screen
    ├── games.js        # Game engines: Patterns, Odd One Out, Sequence, Memory, Maths
    ├── trivia.js       # Live Trivia engine — fetches from Open Trivia DB API
    └── app.js          # Bootstrap, event wiring, screen routing
```

---

## 💾 Data Storage

All progress is stored locally in the browser using `localStorage` — **no server, no account, no data ever leaves the device.**

The JSON schema stored under key `brain_adventure_v1`:

```json
{
  "profile": {
    "name": "Aria",
    "avatar": "🦄",
    "xp": 420,
    "createdAt": 1725000000000
  },
  "bests": {
    "patterns":  { "score": 10, "total": 10, "pct": 100 },
    "memory":    { "moves": 12, "time": 45 },
    "oddone":    { "score": 9,  "total": 10, "pct": 90  },
    "sequence":  { "score": 8,  "total": 10, "pct": 80  },
    "math":      { "score": 10, "total": 10, "pct": 100 },
    "trivia":    { "score": 7,  "total": 10, "pct": 70  }
  },
  "history": [
    { "game": "math", "score": 8, "total": 10, "pct": 80, "xp": 80, "ts": 1725001000000 }
  ],
  "streaks": {
    "lastPlayedDate": "Thu Sep 11 2026",
    "count": 3
  }
}
```

Storage footprint is under **5 KB** even after 50 games of history.

---

## 🚀 Running Locally

No build tools, no dependencies, no npm.

```bash
git clone https://github.com/kumaralok444/-brain-adventure.git
cd -brain-adventure
open index.html        # macOS
# or just double-click index.html in Finder / Explorer
```

> **Note:** The Live Trivia game requires an internet connection to fetch questions from the Open Trivia DB API. All other games work fully offline.

---

## 🌐 Hosting on GitHub Pages

1. Fork or clone this repo
2. Go to **Settings → Pages**
3. Source: **Deploy from a branch** → `main` → `/ (root)`
4. Save — your game will be live at `https://YOUR_USERNAME.github.io/-brain-adventure/`

---

## 🛠 Tech Stack

| Technology | Usage |
|-----------|-------|
| **HTML5** | Semantic markup, single-page app structure |
| **CSS3** | Flexbox, Grid, CSS variables, keyframe animations, 3D card flip |
| **Vanilla JavaScript (ES6+)** | Modules pattern (IIFE), async/await, localStorage API, Web Audio API |
| **Open Trivia DB** | Free REST API for live trivia questions |
| **GitHub Pages** | Free static hosting |

No frameworks. No dependencies. No build step.

---

## 🧠 Educational Design

Each game targets a specific cognitive skill area aligned with early childhood development:

| Skill | Games |
|-------|-------|
| Pattern recognition | Pattern Play, What's Next? |
| Working memory | Memory Match |
| Logical categorisation | Odd One Out |
| Number sense & arithmetic | Maths Practice, What's Next? |
| General knowledge | Live Trivia |
| Sequential reasoning | What's Next?, Pattern Play |

The XP and streak systems provide **positive reinforcement** without competitive pressure, encouraging children to return and improve at their own pace.

---

## 🔒 Privacy

- Zero data collection
- No cookies, no tracking, no analytics
- No network requests except the Open Trivia DB API for the Trivia game
- All player data lives entirely in the child's own browser

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

*Built with ❤️ for curious young minds.*
