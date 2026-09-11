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
        questions = Array.from({ length: TOTAL_Q }, genPattern);
        UI.showScreen('patterns');
        _renderPattern();
    }

    function _renderPattern() {
        if (qIdx >= questions.length) { _endScored(); return; }
        const q = questions[qIdx];
        UI.setProgress('pt-prog', qIdx, questions.length);
        document.getElementById('pt-score').textContent  = score;
        document.getElementById('pt-qcount').textContent = `Question ${qIdx + 1} of ${questions.length}`;
        document.getElementById('pt-display').textContent = q.seq.join('  ');
        UI.buildOpts('pt-opts', q.opts, q.ans, (btn, chosen) => {
            UI.markAnswer(btn, chosen === q.ans, 'pt-opts', q.ans);
            if (chosen === q.ans) score++;
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
        questions = Array.from({ length: TOTAL_Q }, genOdd);
        UI.showScreen('oddone');
        _renderOdd();
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
        questions = Array.from({ length: TOTAL_Q }, genSequence);
        UI.showScreen('sequence');
        _renderSeq();
    }

    function _renderSeq() {
        if (qIdx >= questions.length) { _endScored(); return; }
        const q = questions[qIdx];
        UI.setProgress('sq-prog', qIdx, questions.length);
        document.getElementById('sq-score').textContent  = score;
        document.getElementById('sq-qcount').textContent = `Question ${qIdx + 1} of ${questions.length}`;
        document.getElementById('sq-display').textContent = q.seq.join('  ');
        UI.buildOpts('sq-opts', q.opts, q.ans, (btn, chosen) => {
            UI.markAnswer(btn, chosen === q.ans, 'sq-opts', q.ans);
            if (chosen === q.ans) score++;
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

    function startMemory() {
        gameId = 'memory';
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
    }

    function _buildMemGrid() {
        const pool = shuffle([...MEM_EMOJIS, ...MEM_EMOJIS]);
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
        questions = Array.from({ length: TOTAL_Q }, genMath);
        UI.showScreen('math');
        _renderMath();
    }

    function _renderMath() {
        if (qIdx >= questions.length) { _endScored(); return; }
        const q = questions[qIdx];
        UI.setProgress('math-prog', qIdx, questions.length);
        document.getElementById('math-score').textContent  = score;
        document.getElementById('math-qcount').textContent = `Question ${qIdx + 1} of ${questions.length}`;
        document.getElementById('math-display').textContent = q.question;
        UI.buildOpts('math-opts', q.opts, q.ans, (btn, chosen) => {
            UI.markAnswer(btn, chosen === q.ans, 'math-opts', q.ans);
            if (chosen === q.ans) score++;
            document.getElementById('math-score').textContent = score;
            qIdx++;
            setTimeout(_renderMath, 1100);
        });
    }

    function getCurrentGame() { return gameId; }

    return { startPatterns, startOdd, startSequence, startMemory, startMath, getCurrentGame };
})();
