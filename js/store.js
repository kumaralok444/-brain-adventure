// ─── Persistent storage via localStorage (JSON) ─────────────────────────────
// Schema:
// {
//   profile: { name, avatar, xp, createdAt },
//   bests:   { patterns: { score, total, pct }, memory: { moves, time }, ... },
//   history: [ { game, score, total, xp, ts }, ... ]   ← max 50 entries
//   streaks: { lastPlayedDate, count }
// }

const STORE_KEY = 'brain_adventure_v1';
const HISTORY_LIMIT = 50;

const Store = (() => {

    function _load() {
        try {
            return JSON.parse(localStorage.getItem(STORE_KEY)) || _defaults();
        } catch {
            return _defaults();
        }
    }

    function _save(data) {
        localStorage.setItem(STORE_KEY, JSON.stringify(data));
    }

    function _defaults() {
        return { profile: { name: '', avatar: '🦄', xp: 0, createdAt: Date.now() }, bests: {}, history: [], streaks: { lastPlayedDate: null, count: 0 } };
    }

    // ── profile ──────────────────────────────────────

    function getProfile() { return _load().profile; }

    function saveProfile(name, avatar) {
        const d = _load();
        d.profile.name   = name.trim();
        d.profile.avatar = avatar;
        _save(d);
    }

    // ── XP ───────────────────────────────────────────

    function addXP(amount) {
        const d = _load();
        d.profile.xp = (d.profile.xp || 0) + amount;
        _save(d);
        return d.profile.xp;
    }

    function getXP() { return _load().profile.xp || 0; }

    // ── bests ─────────────────────────────────────────

    function getBest(game) { return _load().bests[game] || null; }

    function updateBest(game, entry) {
        const d = _load();
        d.bests[game] = entry;
        _save(d);
    }

    // Returns true if this is a new personal best
    function checkAndUpdateBest(game, entry) {
        const current = getBest(game);
        let isNew = false;
        if (game === 'memory') {
            // lower moves + lower time = better
            if (!current || entry.moves < current.moves || (entry.moves === current.moves && entry.time < current.time)) {
                updateBest(game, entry);
                isNew = true;
            }
        } else {
            if (!current || entry.pct > current.pct || (entry.pct === current.pct && entry.score > current.score)) {
                updateBest(game, entry);
                isNew = true;
            }
        }
        return isNew;
    }

    // ── history ───────────────────────────────────────

    function addHistory(game, score, total, xpEarned) {
        const d = _load();
        d.history.unshift({ game, score, total, pct: total ? Math.round(score / total * 100) : 0, xp: xpEarned, ts: Date.now() });
        if (d.history.length > HISTORY_LIMIT) d.history = d.history.slice(0, HISTORY_LIMIT);
        _save(d);
    }

    function getHistory() { return _load().history; }

    // ── streaks ───────────────────────────────────────

    function updateStreak() {
        const d = _load();
        const today = new Date().toDateString();
        const last  = d.streaks.lastPlayedDate;
        if (last === today) return d.streaks.count;
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        d.streaks.count = (last === yesterday) ? (d.streaks.count || 0) + 1 : 1;
        d.streaks.lastPlayedDate = today;
        _save(d);
        return d.streaks.count;
    }

    function getStreak() { return _load().streaks; }

    // ── aggregate stats ───────────────────────────────

    function getStats() {
        const d   = _load();
        const h   = d.history;
        const total   = h.length;
        const totalXP = d.profile.xp || 0;
        const avgPct  = total ? Math.round(h.reduce((s, e) => s + (e.pct || 0), 0) / total) : 0;
        const perfect = h.filter(e => e.pct === 100).length;
        return { total, totalXP, avgPct, perfect, streak: d.streaks.count || 0 };
    }

    return { getProfile, saveProfile, addXP, getXP, getBest, checkAndUpdateBest, addHistory, getHistory, getStats, updateStreak, getStreak };
})();
