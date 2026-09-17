// ─── Global helpers ──────────────────────────────────────────────────────────

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ─── Emoji pools ─────────────────────────────────────────────────────────────

const PATTERN_POOLS = {
    animals: ['🐶','🐱','🐻','🐸','🦊','🐼','🐯','🦁','🐨','🐙'],
    food:    ['🍎','🍊','🍋','🍇','🍓','🍕','🍔','🌮','🍩','🍦'],
    nature:  ['🌸','🌺','🌻','🌹','🌈','⭐','🌙','☀️','🌊','🍀'],
    colors:  ['🔴','🔵','🟡','🟢','🟠','🟣','🔶','🔷','⬛','⬜'],
};

const ODD_POOLS = [
    { name: 'animals',  items: ['🐶','🐱','🐻','🐸','🦊','🐼','🐯','🦁','🐨','🐙','🦒','🐘'] },
    { name: 'fruits',   items: ['🍎','🍊','🍋','🍇','🍓','🍑','🍍','🥭','🍒','🍌','🍐','🍈'] },
    { name: 'vehicles', items: ['🚗','🚕','🚙','🚌','🏎','🚐','🚑','🚒','🚂','🚁','✈️','🛳️'] },
    { name: 'flowers',  items: ['🌸','🌺','🌻','🌹','🌼','🌷','💐','🪷'] },
    { name: 'sports',   items: ['⚽','🏀','🎾','🏈','⚾','🏐','🎱','🏓','🥊','🏸'] },
    { name: 'music',    items: ['🎸','🎺','🥁','🎻','🎹','🪗','🎷'] },
    { name: 'sweets',   items: ['🍰','🎂','🍩','🍪','🍭','🍫','🧁','🍮'] },
    { name: 'nature',   items: ['🌊','🏔️','🌋','🏜️','🌿','🍀','🌲','🌴','🌾','🍄'] },
];

// Static emoji sequences — wrong options must NOT include any emoji already visible in seq
const EMOJI_SEQS = [
    { seq: ['🌑','🌒','🌓','🌔','❓'],  ans: '🌕',  opts: ['🌕','🌗','⭐','☀️']  },
    { seq: ['🔴','🟠','🟡','🟢','❓'],  ans: '🔵',  opts: ['🔵','🟣','🟤','⚫']  },
    { seq: ['🌱','🌿','🌳','❓'],        ans: '🌲',  opts: ['🌲','🍂','🌵','🌾']  },
    { seq: ['🐭','🐱','🐕','🦁','❓'],  ans: '🐘',  opts: ['🐘','🦒','🦏','🐊']  },
    { seq: ['🌅','☀️','🌆','❓'],        ans: '🌙',  opts: ['🌙','⭐','🌟','💫']  },
    { seq: ['😊','😄','😁','❓'],        ans: '😆',  opts: ['😆','😂','🤣','😝']  },
    { seq: ['🐣','🐥','🐔','❓'],        ans: '🥚',  opts: ['🥚','🦆','🐦','🦅']  },
    { seq: ['🌧️','🌤️','☀️','🌤️','❓'],ans: '🌧️', opts: ['🌧️','⛈️','❄️','🌪️'] },
];

// Memory emoji pools grouped by theme — agent picks a theme each session
const MEM_POOLS = {
    animals:  ['🦊','🐼','🐯','🦁','🐸','🐙','🦋','🐬','🦖','🐧','🦒','🐘'],
    space:    ['🚀','🌙','⭐','🪐','☄️','🌍','🛸','🌟','🌠','💫','🔭','🌌'],
    food:     ['🍦','🍕','🍩','🌮','🍓','🍔','🧁','🍭','🍋','🍇','🍜','🥑'],
    sports:   ['⚽','🏀','🎾','🏈','🎯','🏓','🥊','🎸','🎺','🎻','🏆','🎮'],
    nature:   ['🌈','🌸','🌻','🍀','🌊','🏔️','🌋','🍄','🌴','🌺','❄️','🦄'],
};
const AVATARS     = ['🦄','🐯','🐼','🦁','🦊','🐸','🐙','🦋','🐬','🦖'];
const GAME_NAMES  = { patterns:'🎨 Patterns', memory:'🧠 Memory', oddone:'🔍 Odd One Out', sequence:'🔢 Sequence', trivia:'🌍 Live Trivia', math:'➕ Maths', numberorder:'🔢 Number Order' };

// ─── Question generators ──────────────────────────────────────────────────────

function genPattern(forcedPool) {
    const poolKey = forcedPool || pick(Object.keys(PATTERN_POOLS));
    const pool    = shuffle(PATTERN_POOLS[poolKey]);
    const [A, B, C] = pool;

    const templates = [
        { seq: [A,B,A,B],      ans: A },
        { seq: [A,A,B,B,A,A],  ans: B },
        { seq: [A,B,B,A,B],    ans: B },
        { seq: [A,A,B,A,A],    ans: B },
        { seq: [A,B,C,A,B],    ans: C },
    ];

    const t = pick(templates);

    // distractors: emojis already in the pattern (excluding the answer) come first
    // so all 4 options look like they could belong — no easy elimination
    const inPattern  = [...new Set(t.seq)].filter(e => e !== t.ans);
    const extraPool  = pool.slice(3).filter(e => e !== t.ans && !inPattern.includes(e));
    const distractors = shuffle([...inPattern, ...extraPool]).slice(0, 3);

    // ensure exactly 3 distractors (pad from pool if somehow short)
    while (distractors.length < 3) {
        const filler = pool.find(e => e !== t.ans && !distractors.includes(e));
        if (filler) distractors.push(filler); else break;
    }

    const opts = shuffle([t.ans, ...distractors]);

    return { seq: [...t.seq, '❓'], ans: t.ans, opts, subtype: poolKey };
}

function genOdd(forcedCat) {
    const idx     = shuffle([...Array(ODD_POOLS.length).keys()]);
    const mainCat = forcedCat
        ? ODD_POOLS.find(p => p.name === forcedCat) || ODD_POOLS[idx[0]]
        : ODD_POOLS[idx[0]];
    // odd item comes from a different category
    const oddPool = ODD_POOLS.filter(p => p.name !== mainCat.name);
    const oddCat  = pick(oddPool);

    const mainItems = shuffle([...mainCat.items]).slice(0, 3);
    const oddItem   = shuffle([...oddCat.items])[0];

    const items = shuffle([...mainItems, oddItem]);
    const odd   = items.indexOf(oddItem);

    return { items, odd, subtype: mainCat.name };
}

function genSequence(forcedType) {
    if (forcedType === 'numbers') return _genNumSeq();
    if (forcedType === 'emoji')   return { ...pick(EMOJI_SEQS), subtype: 'emoji' };
    return Math.random() < 0.55 ? _genNumSeq() : { ...pick(EMOJI_SEQS), subtype: 'emoji' };
}

function _genNumSeq(forcedStep) {
    const type = forcedStep || pick(['step1','step2','step5','step10','desc','odds']);
    let start, step, count = 4;

    switch (type) {
        case 'step1':  step = 1;  start = randInt(1, 8);  break;
        case 'step2':  step = 2;  start = randInt(1, 5) * 2; break;
        case 'step5':  step = 5;  start = randInt(1, 4) * 5; break;
        case 'step10': step = 10; start = randInt(1, 3) * 10; break;
        case 'desc':   step = -1; start = randInt(6, 12); break;
        case 'odds':   step = 2;  start = randInt(0, 4) * 2 + 1; break; // odd nums
    }

    const nums = Array.from({length: count}, (_, i) => start + i * step);
    const ans  = start + count * step;

    // skip if answer would be ≤ 0
    if (ans <= 0) return _genNumSeq();

    const absStep = Math.max(1, Math.abs(step));
    const wrongs  = shuffle([-2,-1,1,2,-3,3].map(d => ans + d * absStep))
        .filter(n => n !== ans && n > 0 && !nums.includes(n))
        .slice(0, 3);

    // pad with numbers outside the sequence if not enough wrongs
    for (let d = 4; wrongs.length < 3; d++) {
        const w = ans + d * absStep;
        if (w > 0 && !nums.includes(w) && !wrongs.includes(w)) wrongs.push(w);
    }

    const opts = shuffle([String(ans), ...wrongs.map(String)]);
    return { seq: [...nums.map(String), '❓'], ans: String(ans), opts, subtype: 'numbers' };
}

function genMemoryPool(forcedTheme) {
    const theme = forcedTheme || pick(Object.keys(MEM_POOLS));
    const pool  = shuffle([...MEM_POOLS[theme]]).slice(0, 8);
    return { theme, emojis: pool };
}

function genNumberOrder(forcedType) {
    const type = forcedType || pick(['before','before','after','after','middle','ascending','descending']);

    if (type === 'before') {
        const n   = randInt(3, 15);
        const vis = [n, n + 1];           // numbers visible in question
        return { type, seq: [null, n, n + 1], ans: n - 1, opts: _numOpts(n - 1, vis) };
    }
    if (type === 'after') {
        const n   = randInt(2, 14);
        const vis = [n - 1, n];
        return { type, seq: [n - 1, n, null], ans: n + 1, opts: _numOpts(n + 1, vis) };
    }
    if (type === 'middle') {
        const n   = randInt(2, 14);
        const vis = [n - 1, n + 1];
        return { type, seq: [n - 1, null, n + 1], ans: n, opts: _numOpts(n, vis) };
    }
    if (type === 'ascending') {
        const start = randInt(1, 11);
        const order = [start, start + 1, start + 2, start + 3];
        return { type, order, nums: shuffle([...order]) };
    }
    // descending
    const start = randInt(5, 14);
    const order = [start, start - 1, start - 2, start - 3];
    return { type, order, nums: shuffle([...order]) };
}

function _numOpts(ans, exclude = []) {
    const wrongs = new Set();
    for (const d of shuffle([-3, -2, -1, 1, 2, 3, -4, 4, -5, 5])) {
        const w = ans + d;
        if (w >= 1 && w !== ans && !exclude.includes(w)) wrongs.add(w);
        if (wrongs.size >= 3) break;
    }
    return shuffle([ans, ...[...wrongs]]);
}

function genMath(forcedType) {
    const type = forcedType || pick(['add','add','add','sub','mul2','mul3']);
    let question, ans;

    if (type === 'add') {
        const a = randInt(1, 9), b = randInt(1, 9);
        question = `${a} + ${b} = ?`;
        ans = a + b;
    } else if (type === 'sub') {
        const b = randInt(1, 5);
        const a = b + randInt(1, 6);
        question = `${a} − ${b} = ?`;
        ans = a - b;
    } else if (type === 'mul2') {
        const a = randInt(1, 10);
        question = `${a} × 2 = ?`;
        ans = a * 2;
    } else {
        const a = randInt(1, 8);
        question = `${a} × 3 = ?`;
        ans = a * 3;
    }

    const wrongs = new Set();
    for (const d of shuffle([-3,-2,-1,1,2,3,-4,4,-5,5])) {
        const w = ans + d;
        if (w > 0 && w !== ans) wrongs.add(w);
        if (wrongs.size >= 3) break;
    }

    const opts = shuffle([String(ans), ...[...wrongs].map(String)]);
    return { question, ans: String(ans), opts, subtype: type };
}
