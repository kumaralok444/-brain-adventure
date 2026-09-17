// ─── Bootstrap ───────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

    // wire game cards
    document.querySelectorAll('.game-card[data-game]').forEach(btn => {
        btn.addEventListener('click', () => {
            const game = btn.dataset.game;
            if (game === 'patterns')      Games.startPatterns();
            else if (game === 'memory')   Games.startMemory();
            else if (game === 'oddone')   Games.startOdd();
            else if (game === 'sequence') Games.startSequence();
            else if (game === 'math')     Games.startMath();
            else if (game === 'trivia')       Trivia.startTrivia();
            else if (game === 'numberorder') Games.startNumberOrder();
        });
    });

    // replay button on result screen
    document.getElementById('res-replay').addEventListener('click', () => {
        const g = Games.getCurrentGame() || sessionStorage.getItem('lastGame');
        if (g === 'patterns')          Games.startPatterns();
        else if (g === 'memory')       Games.startMemory();
        else if (g === 'oddone')       Games.startOdd();
        else if (g === 'sequence')     Games.startSequence();
        else if (g === 'math')         Games.startMath();
        else if (g === 'trivia')       Trivia.startTrivia();
        else if (g === 'numberorder') Games.startNumberOrder();
    });

    // close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(ov => {
        ov.addEventListener('click', e => {
            if (e.target === ov) UI.closeModal(ov.id);
        });
    });

    // initial home refresh (loads profile, bests, streak)
    UI.refreshHome();
});
