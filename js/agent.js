// ─── GameAgent — offline practice agent for all games ─────────────────────────
//
// For every game, tracks per-subtype accuracy in localStorage.
// On each session start it builds a fresh weighted 10-question plan
// (weak subtypes get more reps) and shows a 3-2-1 countdown splash
// with today's focus badges before the game begins.

const GameAgent = (() => {

    const SESSION_Q = 10;

    // ── subtype definitions per game ──────────────────
    // emoji shown on the countdown badge, label text
    const GAME_SUBTYPES = {
        patterns: {
            animals: { emoji: '🐶', label: 'Animals' },
            food:    { emoji: '🍎', label: 'Food'    },
            nature:  { emoji: '🌸', label: 'Nature'  },
            colors:  { emoji: '🔴', label: 'Colours' },
        },
        oddone: {
            animals:  { emoji: '🐶', label: 'Animals'  },
            fruits:   { emoji: '🍎', label: 'Fruits'   },
            vehicles: { emoji: '🚗', label: 'Vehicles' },
            flowers:  { emoji: '🌸', label: 'Flowers'  },
            sports:   { emoji: '⚽', label: 'Sports'   },
            music:    { emoji: '🎸', label: 'Music'    },
            sweets:   { emoji: '🍰', label: 'Sweets'   },
            nature:   { emoji: '🌊', label: 'Nature'   },
        },
        sequence: {
            numbers: { emoji: '🔢', label: 'Numbers' },
            emoji:   { emoji: '🌙', label: 'Emoji'   },
        },
        math: {
            add:  { emoji: '➕', label: 'Add'      },
            sub:  { emoji: '➖', label: 'Subtract' },
            mul2: { emoji: '✖️', label: '× 2'      },
            mul3: { emoji: '✖️', label: '× 3'      },
        },
        memory: {
            animals: { emoji: '🦊', label: 'Animals' },
            space:   { emoji: '🚀', label: 'Space'   },
            food:    { emoji: '🍦', label: 'Food'    },
            sports:  { emoji: '⚽', label: 'Sports'  },
            nature:  { emoji: '🌈', label: 'Nature'  },
        },
        spatial: {
            position: { emoji: '📍', label: 'Position'  },
            move:     { emoji: '➡️', label: 'Move'      },
            complete: { emoji: '🧩', label: 'Complete'  },
        },
        numberorder: {
            before:     { emoji: '⬅️', label: 'BEFORE'     },
            after:      { emoji: '➡️', label: 'AFTER'      },
            middle:     { emoji: '🎯', label: 'MIDDLE'     },
            ascending:  { emoji: '🚀', label: 'ASCENDING'  },
            descending: { emoji: '🎢', label: 'DESCENDING' },
        },
    };

    // game display name shown at top of countdown card
    const GAME_LABELS = {
        patterns:    '🎨 Pattern Play',
        oddone:      '🔍 Odd One Out',
        sequence:    '🔢 What\'s Next?',
        math:        '➕ Maths Practice',
        memory:      '🧠 Memory Match',
        spatial:     '🧩 Space & Shape',
        numberorder: '🔢 Number Order',
    };

    // ── weight from accuracy ──────────────────────────
    // no data → 3,  < 50% → 5,  50-79% → 3,  ≥ 80% → 1
    function _weight(stat) {
        if (!stat || stat.total === 0) return 3;
        const pct = stat.correct / stat.total;
        if (pct < 0.5) return 5;
        if (pct < 0.8) return 3;
        return 1;
    }

    // ── build weighted plan (array of subtypes, length = SESSION_Q) ───
    function buildPlan(gameId) {
        const subtypes = Object.keys(GAME_SUBTYPES[gameId] || {});
        if (!subtypes.length) return Array(SESSION_Q).fill(null);

        const stats = Store.getGameStats(gameId);
        const pool  = [];
        subtypes.forEach(t => {
            const w = _weight(stats[t]);
            for (let i = 0; i < w; i++) pool.push(t);
        });

        const shuffled = _shuffle(pool);
        const plan = [];
        for (let i = 0; i < SESSION_Q; i++) plan.push(shuffled[i % shuffled.length]);
        return _shuffle(plan);
    }

    // ── top 2 weakest subtypes (for badge display) ────
    function _focusTypes(gameId) {
        const subtypes = Object.keys(GAME_SUBTYPES[gameId] || {});
        const stats    = Store.getGameStats(gameId);
        return [...subtypes]
            .map(t => ({ t, w: _weight(stats[t]) }))
            .sort((a, b) => b.w - a.w)
            .slice(0, 2)
            .map(x => x.t);
    }

    // ── countdown splash, then call onReady(plan) ─────
    function launch(gameId, onReady) {
        const plan  = buildPlan(gameId);
        const focus = _focusTypes(gameId);
        const defs  = GAME_SUBTYPES[gameId] || {};

        const badges = focus.map(t => {
            const d = defs[t] || { emoji: '⭐', label: t };
            return `<span class="agent-cd-badge">${d.emoji} ${d.label}</span>`;
        }).join('');

        document.getElementById('agent-cd-game').textContent  = GAME_LABELS[gameId] || gameId;
        document.getElementById('agent-cd-focus').innerHTML   = badges;

        const cdEl = document.getElementById('agent-cd-number');
        cdEl.textContent = '3';
        cdEl.className   = 'agent-cd-number';

        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('agent-countdown-screen').classList.add('active');

        let count = 3;
        const tick = setInterval(() => {
            count--;
            const el = document.getElementById('agent-cd-number');
            if (!el) { clearInterval(tick); return; }
            const clone = el.cloneNode(false);
            clone.id = 'agent-cd-number';
            if (count > 0) {
                clone.className   = 'agent-cd-number';
                clone.textContent = count;
            } else {
                clearInterval(tick);
                clone.className   = 'agent-cd-number agent-cd-go';
                clone.textContent = '🎮';
            }
            el.parentNode.replaceChild(clone, el);
            if (count <= 0) setTimeout(() => onReady(plan), 700);
        }, 900);
    }

    function _shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    // kept so existing numberorder code still works
    const NOAgent = {
        launchWithCountdown: (cb) => launch('numberorder', cb),
        TYPE_DISPLAY: GAME_SUBTYPES.numberorder,
    };

    return { launch, buildPlan, GAME_SUBTYPES };
})();

// backward-compat alias used inside games.js for numberorder
const NOAgent = { launchWithCountdown: (cb) => GameAgent.launch('numberorder', cb) };
