// ─── Game engines ─────────────────────────────────────────────────────────────

const Games = (() => {

    const TOTAL_Q = 10;

    let gameId    = '';
    let qIdx      = 0;
    let score     = 0;
    let questions = [];

    // memory state
    let memMoves = 0, memPairs = 0, memFlipped = [], memCanFlip = true, memMatched = new Set();
    let memTimerInterval = null, memSeconds = 0;

    function calcXP(game, correct, total, moves) {
        if (game === 'memory') return Math.max(10, 100 - moves * 3);
        return Math.round((correct / total) * 100);
    }

    function _finish(opts) {
        const newXP = Store.addXP(opts.xp);
        Store.addHistory(gameId, opts.score, opts.total, opts.xp);
        Store.updateStreak();
        document.getElementById('home-xp').textContent = newXP;
        UI.showResult({ ...opts, gameId, xpEarned: opts.xp });
    }

    // ═══════════════════════════════════════════
    //  PATTERN GAME — fully generated
    // ═══════════════════════════════════════════

    function startPatterns() {
        gameId = 'patterns'; qIdx = 0; score = 0;
        GameAgent.launch('patterns', plan => {
            questions = plan.map(sub => genPattern(sub));
            UI.showScreen('patterns');
            _renderPattern();
        });
    }

    function _renderPattern() {
        if (qIdx >= questions.length) { _endScored(); return; }
        const q = questions[qIdx];
        UI.setProgress('pt-prog', qIdx, questions.length);
        document.getElementById('pt-score').textContent  = score;
        document.getElementById('pt-qcount').textContent = `Question ${qIdx + 1} of ${questions.length}`;
        document.getElementById('pt-display').textContent = q.seq.join('  ');
        UI.buildOpts('pt-opts', q.opts, q.ans, (btn, chosen) => {
            const correct = chosen === q.ans;
            UI.markAnswer(btn, correct, 'pt-opts', q.ans);
            Store.recordAnswer('patterns', q.subtype, correct);
            if (correct) score++;
            document.getElementById('pt-score').textContent = score;
            qIdx++;
            setTimeout(_renderPattern, 1100);
        });
    }

    // ═══════════════════════════════════════════
    //  ODD ONE OUT — fully generated
    // ═══════════════════════════════════════════

    function startOdd() {
        gameId = 'oddone'; qIdx = 0; score = 0;
        GameAgent.launch('oddone', plan => {
            questions = plan.map(sub => genOdd(sub));
            UI.showScreen('oddone');
            _renderOdd();
        });
    }

    function _renderOdd() {
        if (qIdx >= questions.length) { _endScored(); return; }
        const q = questions[qIdx];
        UI.setProgress('odd-prog', qIdx, questions.length);
        document.getElementById('odd-score').textContent  = score;
        document.getElementById('odd-qcount').textContent = `Question ${qIdx + 1} of ${questions.length}`;
        const grid = document.getElementById('odd-opts');
        grid.innerHTML = '';
        const oddEmoji = q.items[q.odd];
        q.items.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'odd-btn';
            btn.textContent = item;
            btn.onclick = () => {
                document.querySelectorAll('#odd-opts .odd-btn').forEach(b => b.onclick = null);
                const correct = item === oddEmoji;
                btn.classList.add(correct ? 'correct' : 'wrong');
                if (!correct) document.querySelectorAll('#odd-opts .odd-btn').forEach(b => { if (b.textContent === oddEmoji) b.classList.add('correct'); });
                Store.recordAnswer('oddone', q.subtype, correct);
                if (correct) score++;
                document.getElementById('odd-score').textContent = score;
                UI.showFeed(correct ? '🎉' : '💪');
                UI.beep(correct);
                qIdx++;
                setTimeout(_renderOdd, 1200);
            };
            grid.appendChild(btn);
        });
    }

    // ═══════════════════════════════════════════
    //  SEQUENCE — fully generated
    // ═══════════════════════════════════════════

    function startSequence() {
        gameId = 'sequence'; qIdx = 0; score = 0;
        GameAgent.launch('sequence', plan => {
            questions = plan.map(sub => genSequence(sub));
            UI.showScreen('sequence');
            _renderSeq();
        });
    }

    function _renderSeq() {
        if (qIdx >= questions.length) { _endScored(); return; }
        const q = questions[qIdx];
        UI.setProgress('sq-prog', qIdx, questions.length);
        document.getElementById('sq-score').textContent  = score;
        document.getElementById('sq-qcount').textContent = `Question ${qIdx + 1} of ${questions.length}`;
        document.getElementById('sq-display').textContent = q.seq.join('  ');
        UI.buildOpts('sq-opts', q.opts, q.ans, (btn, chosen) => {
            const correct = chosen === q.ans;
            UI.markAnswer(btn, correct, 'sq-opts', q.ans);
            Store.recordAnswer('sequence', q.subtype, correct);
            if (correct) score++;
            document.getElementById('sq-score').textContent = score;
            qIdx++;
            setTimeout(_renderSeq, 1100);
        });
    }

    // ── shared quiz ender ─────────────────────────────
    function _endScored() {
        const total     = questions.length;
        const pct       = Math.round(score / total * 100);
        const xp        = calcXP(gameId, score, total);
        const isNewBest = Store.checkAndUpdateBest(gameId, { score, total, pct });
        _finish({ score, total, xp, isNewBest });
    }

    // ═══════════════════════════════════════════
    //  MEMORY — already random each time
    // ═══════════════════════════════════════════

    let _memTheme = 'animals';

    function startMemory() {
        gameId = 'memory';
        GameAgent.launch('memory', plan => {
            // plan is an array of themes; pick the first one for this session
            _memTheme = plan[0] || 'animals';
            memMoves = 0; memPairs = 0; memFlipped = []; memCanFlip = true; memMatched = new Set();
            clearInterval(memTimerInterval); memSeconds = 0;
            UI.showScreen('memory');
            document.getElementById('mem-pairs').textContent = '0';
            document.getElementById('mem-moves').textContent = '0';
            document.getElementById('mem-timer').textContent = '⏱ 0s';
            _buildMemGrid();
            memTimerInterval = setInterval(() => {
                memSeconds++;
                document.getElementById('mem-timer').textContent = `⏱ ${memSeconds}s`;
            }, 1000);
        });
    }

    function _buildMemGrid() {
        const { emojis } = genMemoryPool(_memTheme);
        const pool = shuffle([...emojis, ...emojis]);
        const grid = document.getElementById('mem-grid');
        grid.innerHTML = '';
        pool.forEach((emoji, i) => {
            const card = document.createElement('div');
            card.className = 'mem-card';
            card.dataset.emoji = emoji;
            card.dataset.idx   = i;
            card.innerHTML = `<div class="mem-face mem-back">✨</div><div class="mem-face mem-front">${emoji}</div>`;
            card.onclick = () => _flipCard(card);
            grid.appendChild(card);
        });
    }

    function _flipCard(card) {
        if (!memCanFlip) return;
        if (card.classList.contains('flipped')) return;
        if (memMatched.has(+card.dataset.idx)) return;
        if (memFlipped.length >= 2) return;

        card.classList.add('flipped');
        memFlipped.push(card);

        if (memFlipped.length === 2) {
            memMoves++;
            document.getElementById('mem-moves').textContent = memMoves;
            memCanFlip = false;
            const [a, b] = memFlipped;
            if (a.dataset.emoji === b.dataset.emoji) {
                a.classList.add('matched'); b.classList.add('matched');
                memMatched.add(+a.dataset.idx); memMatched.add(+b.dataset.idx);
                memPairs++;
                document.getElementById('mem-pairs').textContent = memPairs;
                memFlipped = []; memCanFlip = true;
                UI.showFeed('🎉'); UI.beep(true);
                if (memPairs === 8) {
                    clearInterval(memTimerInterval);
                    const xp        = calcXP('memory', 0, 0, memMoves);
                    const isNewBest = Store.checkAndUpdateBest('memory', { moves: memMoves, time: memSeconds });
                    const perfect   = memMoves <= 8;
                    Store.recordAnswer('memory', _memTheme, perfect);
                    setTimeout(() => _finish({ score: memMoves, total: 0, xp, isNewBest, memMoves, memTime: memSeconds }), 600);
                }
            } else {
                setTimeout(() => {
                    a.classList.remove('flipped'); b.classList.remove('flipped');
                    memFlipped = []; memCanFlip = true;
                }, 950);
            }
        }
    }

    // ═══════════════════════════════════════════
    //  MATHS — fully generated
    // ═══════════════════════════════════════════

    function startMath() {
        gameId = 'math'; qIdx = 0; score = 0;
        GameAgent.launch('math', plan => {
            questions = plan.map(sub => genMath(sub));
            UI.showScreen('math');
            _renderMath();
        });
    }

    function _renderMath() {
        if (qIdx >= questions.length) { _endScored(); return; }
        const q = questions[qIdx];
        UI.setProgress('math-prog', qIdx, questions.length);
        document.getElementById('math-score').textContent  = score;
        document.getElementById('math-qcount').textContent = `Question ${qIdx + 1} of ${questions.length}`;
        document.getElementById('math-display').textContent = q.question;
        UI.buildOpts('math-opts', q.opts, q.ans, (btn, chosen) => {
            const correct = chosen === q.ans;
            UI.markAnswer(btn, correct, 'math-opts', q.ans);
            Store.recordAnswer('math', q.subtype, correct);
            if (correct) score++;
            document.getElementById('math-score').textContent = score;
            qIdx++;
            setTimeout(_renderMath, 1100);
        });
    }

    // ═══════════════════════════════════════════
    //  NUMBER ORDER — before, after, middle, asc, desc
    //  Fully visual — no reading needed for a 6-year-old
    // ═══════════════════════════════════════════

    const NO_CONFIG = {
        before:     { title: '🔢 Numbers',       hint: '⬅️ ❓',  hintLabel: 'comes BEFORE' },
        after:      { title: '🔢 Numbers',       hint: '❓ ➡️',  hintLabel: 'comes AFTER' },
        middle:     { title: '🔢 Numbers',       hint: '🎯',     hintLabel: 'is in the MIDDLE' },
        ascending:  { title: '🚀 Ascending!',  hint: '🚀',  hintLabel: 'ASCENDING = going UP! Smallest → Biggest' },
        descending: { title: '🎢 Descending!', hint: '🎢',  hintLabel: 'DESCENDING = going DOWN! Biggest → Smallest' },
    };

    // Colour palette for bubbles — one per position index
    const NO_BUBBLE_COLORS = [
        'linear-gradient(135deg,#f093fb,#f5576c)',
        'linear-gradient(135deg,#4facfe,#00f2fe)',
        'linear-gradient(135deg,#43e97b,#38f9d7)',
        'linear-gradient(135deg,#fa709a,#fee140)',
    ];

    function startNumberOrder() {
        gameId = 'numberorder'; qIdx = 0; score = 0;
        // agent builds the type plan, then we generate matching questions
        NOAgent.launchWithCountdown(plan => {
            questions = plan.map(type => genNumberOrder(type));
            UI.showScreen('numberorder');
            _renderNumberOrder();
        });
    }

    function _renderNumberOrder() {
        if (qIdx >= questions.length) { _endScored(); return; }
        const q   = questions[qIdx];
        const cfg = NO_CONFIG[q.type];
        const isOrder = q.type === 'ascending' || q.type === 'descending';

        UI.setProgress('no-prog', qIdx, questions.length);
        document.getElementById('no-score').textContent  = score;
        document.getElementById('no-qcount').textContent = `Question ${qIdx + 1} of ${questions.length}`;
        document.getElementById('no-title').textContent  = cfg.title;

        document.getElementById('no-hint-bar').innerHTML =
            `<span class="no-hint-emoji">${cfg.hint}</span><span class="no-hint-text">${cfg.hintLabel}</span>`;

        // show/hide the two layout zones
        document.getElementById('no-slots-row').style.display    = isOrder ? 'flex' : 'none';
        document.getElementById('no-order-arrow').style.display  = isOrder ? 'block' : 'none';
        document.getElementById('no-bubbles-row').style.display  = isOrder ? 'none' : 'flex';

        if (isOrder) {
            _renderOrderMode(q);
        } else {
            _renderFillMode(q);
        }
    }

    // ── FILL mode: before / after / middle ───────────
    function _renderFillMode(q) {
        const row = document.getElementById('no-bubbles-row');
        row.innerHTML = '';
        q.seq.forEach((val, i) => {
            const wrap = document.createElement('div');
            wrap.className = 'no-bubble-wrap';
            const bub = document.createElement('div');
            bub.className = val === null ? 'no-bubble no-bubble--gap' : 'no-bubble';
            bub.style.background = val === null ? 'none' : NO_BUBBLE_COLORS[i % NO_BUBBLE_COLORS.length];
            bub.textContent = val === null ? '?' : val;
            wrap.appendChild(bub);
            row.appendChild(wrap);
        });

        const ansRow = document.getElementById('no-answer-row');
        ansRow.innerHTML = '';
        ansRow.className = 'no-answer-row';
        const shuffled = [...q.opts].sort(() => Math.random() - 0.5);
        shuffled.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'no-balloon';
            btn.textContent = opt;
            btn.onclick = () => _pickFill(btn, opt, q);
            ansRow.appendChild(btn);
        });
    }

    function _pickFill(btn, chosen, q) {
        document.querySelectorAll('.no-balloon').forEach(b => b.onclick = null);
        const correct = Number(chosen) === q.ans;
        if (correct) {
            btn.classList.add('no-balloon--correct');
            const gapBub = document.querySelector('.no-bubble--gap');
            if (gapBub) {
                gapBub.textContent = chosen;
                gapBub.classList.remove('no-bubble--gap');
                gapBub.classList.add('no-bubble--filled');
                const idx = [...document.querySelectorAll('.no-bubble')].indexOf(gapBub);
                gapBub.style.background = NO_BUBBLE_COLORS[Math.max(idx, 0) % NO_BUBBLE_COLORS.length];
            }
            score++;
        } else {
            btn.classList.add('no-balloon--wrong');
            document.querySelectorAll('.no-balloon').forEach(b => {
                if (Number(b.textContent) === q.ans) b.classList.add('no-balloon--correct');
            });
        }
        Store.recordNOAnswer(q.type, correct);
        document.getElementById('no-score').textContent = score;
        UI.showFeed(correct ? '🎉' : '💪');
        UI.beep(correct);
        qIdx++;
        setTimeout(_renderNumberOrder, 1200);
    }

    // ── ORDER mode: ascending / descending ───────────
    // She sees 4 shuffled bubbles and taps them in the correct order.
    // Each correct tap locks into the next slot. Wrong tap shakes.
    // The whole question counts as 1 point (all 4 correct = point).

    let _orderNextIdx = 0;   // which slot to fill next
    let _orderMistake = false;

    function _renderOrderMode(q) {
        _orderNextIdx = 0;
        _orderMistake = false;

        // direction arrow between slots
        const arrowEl = document.getElementById('no-order-arrow');
        arrowEl.innerHTML = q.type === 'ascending'
            ? '<span class="no-order-dir asc">🚀 ASCENDING &nbsp;· &nbsp;1 → 2 → 3 → 4</span>'
            : '<span class="no-order-dir desc">🎢 DESCENDING &nbsp;· &nbsp;4 → 3 → 2 → 1</span>';

        // empty slot boxes
        const slotsRow = document.getElementById('no-slots-row');
        slotsRow.innerHTML = '';
        q.order.forEach((_, i) => {
            const slot = document.createElement('div');
            slot.className = 'no-slot';
            slot.id = `no-slot-${i}`;
            slot.textContent = '';
            slotsRow.appendChild(slot);
        });

        // shuffled tap bubbles at bottom
        const ansRow = document.getElementById('no-answer-row');
        ansRow.innerHTML = '';
        ansRow.className = 'no-answer-row';
        q.nums.forEach((num, i) => {
            const btn = document.createElement('button');
            btn.className = 'no-balloon';
            btn.style.background = NO_BUBBLE_COLORS[i % NO_BUBBLE_COLORS.length];
            btn.textContent = num;
            btn.dataset.val = num;
            btn.onclick = () => _pickOrder(btn, num, q);
            ansRow.appendChild(btn);
        });
    }

    function _pickOrder(btn, chosen, q) {
        const expected = q.order[_orderNextIdx];
        if (Number(chosen) === expected) {
            // correct tap — fill the slot
            btn.classList.add('no-balloon--correct');
            btn.onclick = null;
            btn.style.visibility = 'hidden';

            const slot = document.getElementById(`no-slot-${_orderNextIdx}`);
            slot.textContent  = chosen;
            slot.className    = 'no-slot no-slot--filled';
            slot.style.background = NO_BUBBLE_COLORS[_orderNextIdx % NO_BUBBLE_COLORS.length];

            UI.beep(true);
            _orderNextIdx++;

            if (_orderNextIdx === q.order.length) {
                // all slots filled!
                if (!_orderMistake) score++;
                Store.recordNOAnswer(q.type, !_orderMistake);
                document.getElementById('no-score').textContent = score;
                UI.showFeed(_orderMistake ? '💪' : '🎉');
                if (!_orderMistake) UI.beep(true);
                qIdx++;
                setTimeout(_renderNumberOrder, 1300);
            }
        } else {
            // wrong tap — shake, mark mistake
            _orderMistake = true;
            btn.classList.add('no-balloon--wrong');
            UI.beep(false);
            UI.showFeed('💪');
            setTimeout(() => btn.classList.remove('no-balloon--wrong'), 450);
        }
    }

    function getCurrentGame() { return gameId; }

    return { startPatterns, startOdd, startSequence, startMemory, startMath, startNumberOrder, getCurrentGame };
})();
