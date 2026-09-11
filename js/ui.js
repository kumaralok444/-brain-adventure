// ─── UI helpers ──────────────────────────────────────────────────────────────

const UI = (() => {

    // ── screen routing ────────────────────────────────

    function showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id + '-screen').classList.add('active');
    }

    // ── progress bar ─────────────────────────────────

    function setProgress(id, current, total) {
        document.getElementById(id).style.width = (current / total * 100) + '%';
    }

    // ── option buttons ────────────────────────────────

    function buildOpts(containerId, opts, answer, cb) {
        const shuffled = [...opts].sort(() => Math.random() - 0.5);
        const grid = document.getElementById(containerId);
        grid.innerHTML = '';
        shuffled.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'opt-btn';
            btn.textContent = opt;
            btn.onclick = () => cb(btn, opt);
            grid.appendChild(btn);
        });
    }

    function markAnswer(btn, correct, containerId, answer) {
        document.querySelectorAll(`#${containerId} .opt-btn`).forEach(b => b.onclick = null);
        btn.classList.add(correct ? 'correct' : 'wrong');
        if (!correct) {
            document.querySelectorAll(`#${containerId} .opt-btn`).forEach(b => {
                if (b.textContent === answer) b.classList.add('correct');
            });
        }
        showFeed(correct ? '🎉' : '💪');
        beep(correct);
    }

    // ── feedback overlay ──────────────────────────────

    function showFeed(emoji) {
        const el = document.getElementById('feed-layer');
        el.innerHTML = `<div class="feedback-pop">${emoji}</div>`;
        setTimeout(() => el.innerHTML = '', 900);
    }

    // ── confetti ──────────────────────────────────────

    function confetti() {
        const layer = document.getElementById('confetti-layer');
        layer.innerHTML = '';
        const colours = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff922b','#cc5de8','#f77f00'];
        for (let i = 0; i < 72; i++) {
            const p = document.createElement('div');
            p.className = 'confetti-piece';
            const size = 6 + Math.random() * 10;
            p.style.cssText = `left:${Math.random()*100}%;top:-20px;width:${size}px;height:${size}px;background:${colours[i % colours.length]};animation-duration:${1.2 + Math.random() * 1.8}s;animation-delay:${Math.random() * 0.6}s;`;
            layer.appendChild(p);
        }
        setTimeout(() => layer.innerHTML = '', 4000);
    }

    // ── sound ─────────────────────────────────────────

    function beep(success) {
        try {
            const ctx  = new (window.AudioContext || window.webkitAudioContext)();
            const osc  = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            if (success) {
                osc.frequency.setValueAtTime(523, ctx.currentTime);
                osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
                osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
                osc.start(); osc.stop(ctx.currentTime + 0.4);
            } else {
                osc.frequency.setValueAtTime(320, ctx.currentTime);
                osc.frequency.setValueAtTime(200, ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                osc.start(); osc.stop(ctx.currentTime + 0.3);
            }
        } catch (_) {}
    }

    // ── home refresh ─────────────────────────────────

    function refreshHome() {
        const p = Store.getProfile();
        document.getElementById('home-mascot').textContent = p.avatar || '🦄';
        document.getElementById('player-greeting').textContent = p.name ? `Hi, ${p.name}! 👋` : 'Hi there! 👋';
        document.getElementById('home-xp').textContent = Store.getXP();

        const { count, lastPlayedDate } = Store.getStreak();
        const sb = document.getElementById('streak-bar');
        if (count >= 2) {
            sb.style.display = 'block';
            document.getElementById('streak-count').textContent = count;
        } else {
            sb.style.display = 'none';
        }

        // best scores on cards
        ['patterns','memory','oddone','sequence','math','trivia'].forEach(g => {
            const best = Store.getBest(g);
            const el   = document.getElementById('best-' + g);
            if (!el) return;
            if (!best) { el.textContent = 'Best: —'; return; }
            el.textContent = g === 'memory' ? `Best: ${best.moves} moves` : `Best: ${best.score}/${best.total}`;
        });
    }

    // ── profile modal ─────────────────────────────────

    function openProfile() {
        const p   = Store.getProfile();
        const row = document.getElementById('avatar-row');
        row.innerHTML = '';
        AVATARS.forEach(av => {
            const btn = document.createElement('button');
            btn.className = 'avatar-opt' + (av === (p.avatar || '🦄') ? ' selected' : '');
            btn.textContent = av;
            btn.onclick = () => {
                document.querySelectorAll('.avatar-opt').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            };
            row.appendChild(btn);
        });
        document.getElementById('profile-name').value = p.name || '';
        document.getElementById('profile-modal').style.display = 'flex';
    }

    function saveProfile() {
        const name   = document.getElementById('profile-name').value;
        const selAv  = document.querySelector('.avatar-opt.selected');
        const avatar = selAv ? selAv.textContent : '🦄';
        Store.saveProfile(name, avatar);
        closeModal('profile-modal');
        refreshHome();
    }

    // ── stats modal ───────────────────────────────────

    function openStats() {
        const s = Store.getStats();
        document.getElementById('stat-boxes').innerHTML = `
            <div class="stat-box"><div class="s-val">${s.total}</div><div class="s-lbl">Games Played</div></div>
            <div class="stat-box"><div class="s-val">${s.totalXP}</div><div class="s-lbl">Total XP</div></div>
            <div class="stat-box"><div class="s-val">${s.avgPct}%</div><div class="s-lbl">Avg Score</div></div>
            <div class="stat-box"><div class="s-val">${s.perfect}</div><div class="s-lbl">Perfect Games</div></div>`;

        const history  = Store.getHistory();
        const histList = document.getElementById('history-list');
        if (!history.length) {
            histList.innerHTML = '<div style="color:#aaa;padding:10px">No games played yet!</div>';
        } else {
            histList.innerHTML = history.slice(0, 20).map(h => {
                const d = new Date(h.ts);
                const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                const gameName = GAME_NAMES[h.game] || h.game;
                const scoreStr = h.game === 'memory' ? `${h.score} moves` : `${h.score}/${h.total}`;
                return `<div class="history-item"><span class="h-game">${gameName}</span><span class="h-score">${scoreStr}</span><span class="h-xp">+${h.xp}xp</span><span class="h-date">${dateStr}</span></div>`;
            }).join('');
        }
        document.getElementById('stats-modal').style.display = 'flex';
    }

    function closeModal(id) {
        document.getElementById(id).style.display = 'none';
    }

    // ── result screen ─────────────────────────────────

    function showResult({ correct, total, gameId, isNewBest, xpEarned, memMoves, memTime }) {
        const pct = total ? correct / total : 0;
        let emoji, title, stars;
        if (gameId === 'memory') {
            emoji = '🎉'; title = 'All pairs found!'; stars = '⭐⭐⭐⭐⭐';
            document.getElementById('res-num').textContent  = `${memMoves} Moves · ${memTime}s`;
            document.getElementById('res-msg').textContent  = memMoves <= 14 ? 'Incredible memory! 🧠✨' : 'Well done! Try to beat your score!';
        } else {
            if (pct >= 0.9)      { emoji='🏆'; title='Superstar!';    stars='⭐⭐⭐⭐⭐'; }
            else if (pct >= 0.7) { emoji='🎉'; title='Great Job!';    stars='⭐⭐⭐⭐'; }
            else if (pct >= 0.5) { emoji='😊'; title='Good Try!';     stars='⭐⭐⭐'; }
            else                 { emoji='💪'; title='Keep Going!';   stars='⭐⭐'; }
            document.getElementById('res-num').textContent = `${correct} / ${total}`;
            document.getElementById('res-msg').textContent = pct >= 0.9 ? "You're absolutely amazing! 🌟"
                : pct >= 0.7 ? "You did really well — keep it up!"
                : pct >= 0.5 ? "Nice effort! Try again for more stars!"
                : "Good try! Practice makes perfect!";
        }
        document.getElementById('res-emoji').textContent = emoji;
        document.getElementById('res-title').textContent = title;
        document.getElementById('res-stars').textContent = stars;
        document.getElementById('xp-earned').textContent = `+${xpEarned} XP earned!`;
        const badge = document.getElementById('new-best');
        badge.style.display = isNewBest ? 'inline-block' : 'none';
        if (pct >= 0.9 || gameId === 'memory') confetti();
        showScreen('result');
    }

    return { showScreen, setProgress, buildOpts, markAnswer, showFeed, confetti, beep, refreshHome, openProfile, saveProfile, openStats, closeModal, showResult };
})();

// expose to inline HTML handlers
function openProfile() { UI.openProfile(); }
function saveProfile() { UI.saveProfile(); }
function openStats()   { UI.openStats(); }
function closeModal(id){ UI.closeModal(id); }
function goHome()      { UI.showScreen('home'); UI.refreshHome(); }
