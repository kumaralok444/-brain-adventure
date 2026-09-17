# 🌟 Brain Adventure

An interactive, browser-based educational game webapp designed for young children (ages 5–7) to practise **analytical thinking, reasoning, pattern recognition, memory, and maths** — all through colourful emoji-powered games.

No installation. No login. No server. Just open `index.html` in any browser and play.

🎮 **Live Demo:** [https://kumaralok444.github.io/-brain-adventure/](https://kumaralok444.github.io/-brain-adventure/)

---

## 📸 Screenshots

| Home Screen | Pattern Play | Number Order |
|:-----------:|:------------:|:------------:|
| Pick from 7 games | Complete emoji patterns | Before, after, middle & ordering |

---

## 🎮 Games

### 🎨 Pattern Play
Children are shown a repeating emoji sequence with the last item hidden as `❓` and must choose what comes next.

- Patterns are **algorithmically generated** every session — no two games are the same
- Uses 4 themed emoji pools: animals, food, nature, colours
- Pattern templates include AB, AABB, ABB, AAB, and ABC sequences
- **Distractors include emojis already in the pattern** — no easy elimination by spotting the unfamiliar one
- Builds: **pattern recognition**, **logical prediction**, **visual reasoning**

---

### 🧠 Memory Match
A classic card-flip memory game with 16 cards (8 matching emoji pairs).

- **5 themed emoji pools** — animals, space, food, sports, nature — agent picks the best theme each session
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
- Wrong options never include numbers/emojis already visible in the sequence
- Builds: **number sense**, **sequential reasoning**, **pattern logic**

---

### ➕ Maths Practice
Fresh arithmetic questions every session, appropriate for ages 5–7.

- **Addition** — e.g. `6 + 7 = ?` (numbers 1–9)
- **Subtraction** — e.g. `9 − 4 = ?` (always positive answers)
- **×2 tables** — e.g. `5 × 2 = ?`
- **×3 tables** — e.g. `4 × 3 = ?`
- Builds: **arithmetic fluency**, **number bonds**, **multiplication foundations**

---

### 🔢 Number Order *(new)*
Fully visual number game — no reading required. Three question types for before/after/middle, plus two ordering modes.

**Fill the gap** (before / after / middle):
- A row of colourful number bubbles with one pulsing gold `?` bubble
- Child taps the correct answer balloon; the answer pops into the gap

**Ordering** (ascending / descending):
- Four shuffled colourful number bubbles at the bottom
- Empty slots at the top labelled **🚀 ASCENDING · 1→2→3→4** or **🎢 DESCENDING · 4→3→2→1**
- Child taps bubbles one by one in the correct order — each correct tap flies into the next slot
- Wrong tap shakes but stays in place so she can try again
- Vocabulary (ASCENDING / DESCENDING) appears on the game title, hint bar, and direction pill every round so the words are learned through repetition

Builds: **number ordering**, **sequencing**, **mathematical vocabulary**

---

### 🌍 Live Trivia Quiz
Powered by the free **Open Trivia DB API** — fetches 10 brand-new questions every single session.

- Categories rotate between: 🐾 Animals, 🌿 Nature, 💡 General Knowledge
- Easy difficulty, multiple-choice format
- Handles offline/API errors gracefully with a retry button
- Builds: **general knowledge**, **reading comprehension**, **quick thinking**

---

## 🤖 Offline Practice Agent

Every game is powered by a lightweight **offline agent** (`js/agent.js`) that runs entirely in the browser — no server, no API.

**How it works:**
1. On every session start the agent reads per-subtype accuracy from `localStorage`
2. It assigns weights — weak subtypes get more reps, mastered ones stay fresh with fewer
3. Builds a fresh 10-question plan tailored to today's weak spots
4. Shows a **3 → 2 → 1 → 🎮 countdown splash** with the game name and focus badges before each session

**Accuracy weighting:**

| Accuracy | Weight | Meaning |
|----------|--------|---------|
| Never tried | 3 | Fair start |
| < 50% | 5 | Needs most practice |
| 50–79% | 3 | Still working on it |
| ≥ 80% | 1 | Mastered — keep fresh |

**What each game tracks:**

| Game | Subtypes tracked |
|------|-----------------|
| Pattern Play | Animals, Food, Nature, Colours |
| Odd One Out | Animals, Fruits, Vehicles, Flowers, Sports, Music, Sweets, Nature |
| What's Next? | Numbers, Emoji |
| Maths Practice | Add, Subtract, ×2, ×3 |
| Memory Match | Animals, Space, Food, Sports, Nature |
| Number Order | Before, After, Middle, Ascending, Descending |

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
| 🤖 **Practice Agent** | Adaptive per-subtype question planner — gets smarter each session |
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
    ├── data.js         # Emoji pools + all question generators
    ├── store.js        # Persistence — reads/writes JSON to localStorage
    ├── ui.js           # Rendering helpers, modals, confetti, sound, result screen
    ├── games.js        # Game engines for all 7 games
    ├── agent.js        # Offline practice agent — adaptive question planner
    ├── trivia.js       # Live Trivia engine — fetches from Open Trivia DB API
    └── app.js          # Bootstrap, event wiring, screen routing
```

---

## 💾 Data Storage

All progress is stored locally in the browser using `localStorage` — **no server, no account, no data ever leaves the device.**

The JSON schema stored under key `brain_adventure_v1`:

```json
{
  "profile": { "name": "Aria", "avatar": "🦄", "xp": 420 },
  "bests": {
    "patterns":    { "score": 10, "total": 10, "pct": 100 },
    "memory":      { "moves": 12, "time": 45 },
    "numberorder": { "score": 9,  "total": 10, "pct": 90 }
  },
  "history": [
    { "game": "math", "score": 8, "total": 10, "pct": 80, "xp": 80, "ts": 1725001000000 }
  ],
  "streaks": { "lastPlayedDate": "Thu Sep 17 2026", "count": 3 },
  "agentStats": {
    "patterns":    { "animals": { "correct": 8, "total": 10 } },
    "numberorder": { "ascending": { "correct": 3, "total": 8 } }
  }
}
```

Storage footprint is under **6 KB** even after 50 games of history.

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
| **Vanilla JavaScript (ES6+)** | IIFE modules, async/await, localStorage API, Web Audio API |
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
| Number ordering & vocabulary | Number Order |
| General knowledge | Live Trivia |
| Sequential reasoning | What's Next?, Pattern Play, Number Order |

The XP and streak systems provide **positive reinforcement** without competitive pressure, encouraging children to return and improve at their own pace. The offline agent ensures every session focuses on what the child actually needs to practise — not just random repetition.

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
