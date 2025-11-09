(function () {
    'use strict';

    const THEME_KEY = 'siteThemeMode';

    function createThemeToggle() {
        const container = document.querySelector('.nav-wrap');
        if (!container) return null;

        const existing = document.getElementById('theme-toggle');
        if (existing) return existing;

        const btn = document.createElement('button');
        btn.id = 'theme-toggle';
        btn.type = 'button';
        btn.className = 'bg-btn';
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('title', 'Toggle light / dark mode');
        btn.innerHTML = '<span class="bg-icon" aria-hidden="true">🌓</span><span class="bg-label">Theme</span>';
        container.appendChild(btn);
        return btn;
    }

    function applyTheme(mode) {
        const isLight = mode === 'light';
        document.body.classList.toggle('light-theme', isLight);
        const btn = document.getElementById('theme-toggle');
        if (btn) btn.setAttribute('aria-pressed', String(isLight));
        try {
            localStorage.setItem(THEME_KEY, mode);
        } catch (e) {
        }
        document.documentElement.style.scrollBehavior = 'auto';
        setTimeout(() => {
            document.documentElement.style.scrollBehavior = '';
        }, 0);
    }

    function getSavedTheme() {
        try {
            const saved = localStorage.getItem(THEME_KEY);
            if (saved === 'light' || saved === 'dark') return saved;
        } catch (e) {}
        try {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
        } catch (e) {}
        return 'dark';
    }

    const btn = createThemeToggle();
    if (!btn) return;

    const initial = getSavedTheme();
    applyTheme(initial);

    btn.addEventListener('click', () => {
        const current = document.body.classList.contains('light-theme') ? 'light' : 'dark';
        const next = current === 'light' ? 'dark' : 'light';
        applyTheme(next);
    });
})();
