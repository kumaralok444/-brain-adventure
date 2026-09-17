// ─── Space & Shape — Spatial Reasoning Game ──────────────────────────────────
//
// Three question types, all fully visual (no reading required):
//
//  POSITION  — 5-cell cross grid, tap which emoji is above/below/left/right/centre
//  MOVE      — same grid, emoji shown at a position, arrow shows direction + steps,
//               tap which cell it lands on
//  COMPLETE  — 3×3 grid with one cell missing, each emoji appears once per row
//               and once per column, tap the missing emoji
//
// All questions are algorithmically generated fresh every session.

const Spatial = (() => {

    const TOTAL_Q  = 10;
    const EMOJIS   = ['🔴','🔵','🟡','🟢','🟠','🟣','🐶','🐱','🐻','🌸','⭐','🍎'];

    // ── cross-grid layout (5 positions) ──────────────
    //        0 (top)
    //  1(L)  2(C)  3(R)
    //        4 (bot)
    const POS_LABEL = ['top','left','centre','right','bottom'];
    const POS_EMOJI = { top:'⬆️', left:'⬅️', centre:'🎯', right:'➡️', bottom:'⬇️' };
    const POS_NAME  = { top:'ABOVE', left:'LEFT', centre:'IN THE MIDDLE', right:'RIGHT', bottom:'BELOW' };

    // for move: neighbours per position, keyed by direction
    // [position][direction] = new position (-1 = off grid / blocked)
    const MOVE_MAP = {
        //         up    down  left  right
        top:    { up:-1, down:2,  left:-1, right:-1 },
        left:   { up:-1, down:-1, left:-1, right:2  },
        centre: { up:0,  down:4,  left:1,  right:3  },
        right:  { up:-1, down:-1, left:2,  right:-1 },
        bottom: { up:2,  down:-1, left:-1, right:-1 },
    };
    const DIR_ARROW = { up:'⬆️', down:'⬇️', left:'⬅️', right:'➡️' };
    const DIR_LABEL = { up:'UP', down:'DOWN', left:'LEFT', right:'RIGHT' };

    let gameId    = 'spatial';
    let qIdx      = 0;
    let score     = 0;
    let questions = [];

    // ── question generators ───────────────────────────

    function _genPosition() {
        const emojis  = shuffle([...EMOJIS]).slice(0, 5);
        // place one emoji at each of the 5 positions
        // positions: 0=top 1=left 2=centre 3=right 4=bottom
        const grid    = emojis;
        const askIdx  = randInt(0, 4);          // which position are we asking about
        const askPos  = POS_LABEL[askIdx];
        const target  = grid[askIdx];

        // ask: "which emoji is [above/below/left/right/centre of] [reference]?"
        // reference: always centre unless askIdx IS centre (then ask about top)
        const refIdx  = askIdx === 2 ? 0 : 2;
        const refPos  = POS_LABEL[refIdx];
        const ref     = grid[refIdx];

        const question = `Which emoji is ${POS_NAME[askPos]} ${ref}?`;
        const opts     = shuffle([target, ...shuffle(emojis.filter(e => e !== target)).slice(0, 3)]);

        return { subtype: 'position', grid, askIdx, question, ans: target, opts };
    }

    function _genMove() {
        const emojis = shuffle([...EMOJIS]).slice(0, 5);
        const grid   = emojis;

        // pick a starting position that has at least one valid move
        const movable = POS_LABEL.filter(p => Object.values(MOVE_MAP[p]).some(v => v !== -1));
        const startPos = pick(movable);
        const startIdx = POS_LABEL.indexOf(startPos);

        // pick a valid direction from that position
        const validDirs = Object.entries(MOVE_MAP[startPos])
            .filter(([, v]) => v !== -1)
            .map(([d]) => d);
        const dir     = pick(validDirs);
        const landIdx = MOVE_MAP[startPos][dir];
        const landed  = grid[landIdx];

        const question = `Move ${grid[startIdx]} one step ${DIR_LABEL[dir]}.\nWhere does it land?`;
        const opts     = shuffle([landed, ...shuffle(emojis.filter(e => e !== landed)).slice(0, 3)]);

        return { subtype: 'move', grid, startIdx, dir, landIdx, question, ans: landed, opts };
    }

    function _genComplete() {
        // build a 3×3 latin-square grid using 3 emojis
        const [A, B, C] = shuffle([...EMOJIS]).slice(0, 3);
        // rows are rotations: [A,B,C], [B,C,A], [C,A,B]
        const rows = shuffle([
            [A, B, C],
            [B, C, A],
            [C, A, B],
        ]);
        // hide one random cell
        const hideRow = randInt(0, 2);
        const hideCol = randInt(0, 2);
        const ans     = rows[hideRow][hideCol];

        // distractors: the other two emojis
        const others  = [A, B, C].filter(e => e !== ans);
        const opts    = shuffle([ans, ...others, pick([A, B, C])]).slice(0, 4);
        // ensure ans in opts
        if (!opts.includes(ans)) opts[0] = ans;

        return { subtype: 'complete', rows, hideRow, hideCol, ans, opts };
    }

    function _gen(subtype) {
        if (subtype === 'position') return _genPosition();
        if (subtype === 'move')     return _genMove();
        return _genComplete();
    }

    // ── rendering ─────────────────────────────────────

    function _render() {
        if (qIdx >= questions.length) { _end(); return; }
        const q = questions[qIdx];

        UI.setProgress('sp-prog', qIdx, questions.length);
        document.getElementById('sp-score').textContent  = score;
        document.getElementById('sp-qcount').textContent = `Question ${qIdx + 1} of ${questions.length}`;

        // type badge
        const badges = { position: '📍 Where is it?', move: '➡️ Move it!', complete: '🧩 Fill the gap!' };
        const colors = { position: '#4facfe', move: '#fa709a', complete: '#43e97b' };
        const typeBar = document.getElementById('sp-type-bar');
        typeBar.innerHTML = `<span class="sp-badge" style="background:${colors[q.subtype]}">${badges[q.subtype]}</span>`;

        if (q.subtype === 'position' || q.subtype === 'move') _renderCross(q);
        else _renderGrid(q);

        // question text
        document.getElementById('sp-question').textContent = q.question;

        // answer options
        const row = document.getElementById('sp-answer-row');
        row.innerHTML = '';
        const BALLOON_COLORS = [
            'linear-gradient(135deg,#f093fb,#f5576c)',
            'linear-gradient(135deg,#4facfe,#00f2fe)',
            'linear-gradient(135deg,#43e97b,#38f9d7)',
            'linear-gradient(135deg,#fa709a,#fee140)',
        ];
        q.opts.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'sp-balloon';
            btn.style.background = BALLOON_COLORS[i % BALLOON_COLORS.length];
            btn.textContent = opt;
            btn.onclick = () => _pick(btn, opt, q);
            row.appendChild(btn);
        });
    }

    function _renderCross(q) {
        const scene = document.getElementById('sp-scene');
        scene.innerHTML = '';
        scene.className = 'sp-scene sp-cross';

        // 5 cells in cross layout: top, left, centre, right, bottom
        //   [0]
        // [1][2][3]
        //   [4]
        const positions = ['top','left','centre','right','bottom'];
        positions.forEach((pos, i) => {
            const cell = document.createElement('div');
            cell.className = `sp-cell sp-cell--${pos}`;

            const isStart = q.subtype === 'move' && i === q.startIdx;
            const isLand  = q.subtype === 'move' && i === q.landIdx;

            if (isLand) {
                // landing cell shown as glowing empty target
                cell.classList.add('sp-cell--target');
                cell.textContent = '❓';
            } else if (isStart) {
                // show start emoji with direction arrow below it
                cell.innerHTML = `<span class="sp-cell-emoji">${q.grid[i]}</span><span class="sp-cell-arrow">${DIR_ARROW[q.dir]}</span>`;
            } else {
                cell.textContent = q.grid[i];
            }

            // for position questions: highlight the reference (centre or top)
            if (q.subtype === 'position') {
                const refIdx = q.askIdx === 2 ? 0 : 2;
                if (i === refIdx) cell.classList.add('sp-cell--ref');
                if (i === q.askIdx) cell.classList.add('sp-cell--ask');
            }

            scene.appendChild(cell);
        });
    }

    function _renderGrid(q) {
        const scene = document.getElementById('sp-scene');
        scene.innerHTML = '';
        scene.className = 'sp-scene sp-grid3';

        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const cell = document.createElement('div');
                cell.className = 'sp-gcell';
                if (r === q.hideRow && c === q.hideCol) {
                    cell.classList.add('sp-gcell--gap');
                    cell.textContent = '?';
                } else {
                    cell.textContent = q.rows[r][c];
                }
                scene.appendChild(cell);
            }
        }
    }

    // ── answer handling ───────────────────────────────

    function _pick(btn, chosen, q) {
        document.querySelectorAll('.sp-balloon').forEach(b => b.onclick = null);
        const correct = chosen === q.ans;

        btn.classList.add(correct ? 'sp-balloon--correct' : 'sp-balloon--wrong');
        if (!correct) {
            document.querySelectorAll('.sp-balloon').forEach(b => {
                if (b.textContent === q.ans) b.classList.add('sp-balloon--correct');
            });
        }

        // on correct position/move: highlight the landing cell
        if (correct && (q.subtype === 'position' || q.subtype === 'move')) {
            const cells = document.querySelectorAll('.sp-cell');
            const idx   = q.subtype === 'move' ? q.landIdx : q.askIdx;
            if (cells[idx]) cells[idx].classList.add('sp-cell--correct');
        }
        // on correct complete: fill the gap cell
        if (correct && q.subtype === 'complete') {
            const gap = document.querySelector('.sp-gcell--gap');
            if (gap) { gap.textContent = q.ans; gap.classList.add('sp-gcell--filled'); }
        }

        Store.recordAnswer('spatial', q.subtype, correct);
        if (correct) score++;
        document.getElementById('sp-score').textContent = score;
        UI.showFeed(correct ? '🎉' : '💪');
        UI.beep(correct);
        qIdx++;
        setTimeout(_render, 1200);
    }

    function _end() {
        const total     = questions.length;
        const pct       = Math.round(score / total * 100);
        const xp        = Math.round(score / total * 100);
        const isNewBest = Store.checkAndUpdateBest('spatial', { score, total, pct });
        Store.addXP(xp);
        Store.addHistory('spatial', score, total, xp);
        Store.updateStreak();
        document.getElementById('home-xp').textContent = Store.getXP();
        UI.showResult({ correct: score, total, xp, isNewBest, gameId: 'spatial', xpEarned: xp });
    }

    // ── public entry point ────────────────────────────

    function start() {
        gameId = 'spatial'; qIdx = 0; score = 0;
        GameAgent.launch('spatial', plan => {
            questions = plan.map(sub => _gen(sub));
            UI.showScreen('spatial');
            _render();
        });
    }

    // helpers (data.js globals available)
    function shuffle(a) { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b; }
    function randInt(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
    function pick(a){return a[Math.floor(Math.random()*a.length)];}

    return { start };
})();
