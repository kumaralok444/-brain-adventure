// ─── Live Trivia via Open Trivia DB ──────────────────────────────────────────
// API: https://opentdb.com/api.php?amount=10&difficulty=easy&type=multiple
// Kid-friendly categories: 27=Animals, 17=Science:Nature, 9=General Knowledge

const Trivia = (() => {

    const CATEGORIES = [
        { id: 27, label: '🐾 Animals' },
        { id: 17, label: '🌿 Nature' },
        { id: 9,  label: '💡 General Knowledge' },
    ];

    // opentdb rate-limits per session token — rotate categories to stay fresh
    let catIndex  = 0;
    let questions = [];
    let qIdx      = 0;
    let score     = 0;

    function _apiUrl() {
        const cat = CATEGORIES[catIndex % CATEGORIES.length];
        catIndex++;
        return `https://opentdb.com/api.php?amount=10&category=${cat.id}&difficulty=easy&type=multiple`;
    }

    // HTML entities decoder (opentdb encodes &amp; etc.)
    function _decode(str) {
        const txt = document.createElement('textarea');
        txt.innerHTML = str;
        return txt.value;
    }

    function _setView(view) {
        document.getElementById('tv-loading').style.display      = view === 'loading'  ? 'block' : 'none';
        document.getElementById('tv-error').style.display        = view === 'error'    ? 'block' : 'none';
        document.getElementById('tv-question-wrap').style.display = view === 'question' ? 'block' : 'none';
    }

    async function startTrivia() {
        qIdx = 0; score = 0;
        sessionStorage.setItem('lastGame', 'trivia');
        UI.showScreen('trivia');
        _setView('loading');
        document.getElementById('tv-score').textContent = '0';
        UI.setProgress('tv-prog', 0, 10);

        try {
            const res  = await fetch(_apiUrl());
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const json = await res.json();
            if (json.response_code !== 0 || !json.results.length) throw new Error('No results');

            questions = json.results.map(r => ({
                category: _decode(r.category),
                question: _decode(r.question),
                correct:  _decode(r.correct_answer),
                opts:     [r.correct_answer, ...r.incorrect_answers].map(_decode),
            }));

            _renderTrivia();
        } catch (err) {
            console.error('Trivia fetch failed:', err);
            _setView('error');
        }
    }

    function _renderTrivia() {
        if (qIdx >= questions.length) { _endTrivia(); return; }
        const q = questions[qIdx];
        _setView('question');
        UI.setProgress('tv-prog', qIdx, questions.length);
        document.getElementById('tv-score').textContent  = score;
        document.getElementById('tv-qcount').textContent = `Question ${qIdx + 1} of ${questions.length}`;
        document.getElementById('tv-category').textContent = q.category;
        document.getElementById('tv-question').textContent = q.question;

        // shuffle options so correct isn't always first
        const shuffled = [...q.opts].sort(() => Math.random() - 0.5);
        const grid = document.getElementById('tv-opts');
        grid.innerHTML = '';
        shuffled.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'opt-btn trivia-opt';
            btn.textContent = opt;
            btn.onclick = () => {
                document.querySelectorAll('#tv-opts .opt-btn').forEach(b => b.onclick = null);
                const correct = opt === q.correct;
                btn.classList.add(correct ? 'correct' : 'wrong');
                if (!correct) {
                    document.querySelectorAll('#tv-opts .opt-btn').forEach(b => {
                        if (b.textContent === q.correct) b.classList.add('correct');
                    });
                }
                if (correct) score++;
                document.getElementById('tv-score').textContent = score;
                UI.showFeed(correct ? '🎉' : '💪');
                UI.beep(correct);
                qIdx++;
                setTimeout(_renderTrivia, 1200);
            };
            grid.appendChild(btn);
        });
    }

    function _endTrivia() {
        const total     = questions.length;
        const pct       = Math.round(score / total * 100);
        const xp        = Math.round((score / total) * 100);
        const isNewBest = Store.checkAndUpdateBest('trivia', { score, total, pct });
        const newXP     = Store.addXP(xp);
        Store.addHistory('trivia', score, total, xp);
        Store.updateStreak();
        document.getElementById('home-xp').textContent = newXP;
        UI.showResult({ correct: score, total, gameId: 'trivia', xpEarned: xp, isNewBest });
    }

    return { startTrivia };
})();
