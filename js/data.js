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

// Static emoji sequences (mixed with generated number ones)
const EMOJI_SEQS = [
    { seq: ['🌑','🌒','🌓','🌔','❓'],  ans: '🌕',  opts: ['🌕','🌑','🌒','🌗'] },
    { seq: ['🔴','🟠','🟡','🟢','❓'],  ans: '🔵',  opts: ['🔵','🔴','🟣','🟤'] },
    { seq: ['🌱','🌿','🌳','❓'],        ans: '🌲',  opts: ['🌲','🌱','🍂','🌵'] },
    { seq: ['🐭','🐱','🐕','🦁','❓'],  ans: '🐘',  opts: ['🐘','🐭','🐠','🐦'] },
    { seq: ['🌅','☀️','🌆','❓'],        ans: '🌙',  opts: ['🌙','☀️','🌅','⭐'] },
    { seq: ['😊','😄','😁','❓'],        ans: '😆',  opts: ['😆','😢','😊','😐'] },
    { seq: ['🐣','🐥','🐔','❓'],        ans: '🥚',  opts: ['🥚','🐥','🦆','🐦'] },
    { seq: ['🌧️','🌤️','☀️','🌤️','❓'],ans: '🌧️', opts: ['🌧️','⛈️','❄️','☀️'] },
];

const MEM_EMOJIS  = ['🦊','🐼','🦋','🌈','🎸','🚀','🍦','🎯'];
const AVATARS     = ['🦄','🐯','🐼','🦁','🦊','🐸','🐙','🦋','🐬','🦖'];
const GAME_NAMES  = { patterns:'🎨 Patterns', memory:'🧠 Memory', oddone:'🔍 Odd One Out', sequence:'🔢 Sequence', trivia:'🌍 Live Trivia', math:'➕ Maths' };

// ─── Question generators ──────────────────────────────────────────────────────

function genPattern() {
    const poolKey = pick(Object.keys(PATTERN_POOLS));
    const pool    = shuffle(PATTERN_POOLS[poolKey]);
    const [A, B, C] = pool;

    // Each entry: seq shown (without ❓), ans = next item
    const templates = [
        { seq: [A,B,A,B],      ans: A },  // AB AB → A
        { seq: [A,A,B,B,A,A],  ans: B },  // AABB AA → B
        { seq: [A,B,B,A,B],    ans: B },  // ABB AB → B
        { seq: [A,A,B,A,A],    ans: B },  // AAB AA → B
        { seq: [A,B,C,A,B],    ans: C },  // ABC AB → C
    ];

    const t       = pick(templates);
    const wrongs  = pool.slice(3, 6);          // 3 items not used in pattern
    const opts    = shuffle([t.ans, ...wrongs]).slice(0, 4);

    // make sure correct answer is in opts
    if (!opts.includes(t.ans)) opts[0] = t.ans;

    return { seq: [...t.seq, '❓'], ans: t.ans, opts };
}

function genOdd() {
    const idx     = shuffle([...Array(ODD_POOLS.length).keys()]);
    const mainCat = ODD_POOLS[idx[0]];
    const oddCat  = ODD_POOLS[idx[1]];

    const mainItems = shuffle([...mainCat.items]).slice(0, 3);
    const oddItem   = shuffle([...oddCat.items])[0];

    const items = shuffle([...mainItems, oddItem]);
    const odd   = items.indexOf(oddItem);

    return { items, odd };
}

function genSequence() {
    // 55% number sequence, 45% emoji sequence
    return Math.random() < 0.55 ? _genNumSeq() : pick(EMOJI_SEQS);
}

function _genNumSeq() {
    const type = pick(['step1','step2','step5','step10','desc','odds']);
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
        .filter(n => n !== ans && n > 0)
        .slice(0, 3);

    // pad if not enough wrongs
    while (wrongs.length < 3) wrongs.push(ans + wrongs.length + 1);

    const opts = shuffle([String(ans), ...wrongs.map(String)]);
    return { seq: [...nums.map(String), '❓'], ans: String(ans), opts };
}

function genMath() {
    const type = pick(['add','add','add','sub','mul2','mul3']);
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
    return { question, ans: String(ans), opts };
}
