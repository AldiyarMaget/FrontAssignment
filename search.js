(function () {
    'use strict';

    const input = document.getElementById('search-input');
    const suggestions = document.getElementById('suggestions');

    if (!input || !suggestions) return;

    const MAX_SUGGEST = 6;
    let index = [];

    function escRegex(s) { return s.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); }
    function textOf(el) { return (el && el.textContent || '').trim().replace(/\s+/g, ' '); }

    function buildIndex() {
        const items = [];

        const h1 = document.querySelector('.anime-hero h1') || document.querySelector('h1');
        if (h1) items.push({ type: 'title', title: textOf(h1), text: textOf(h1), el: h1 });

        const subtitle = document.querySelector('.anime-hero .subtitle') || document.querySelector('.subtitle');
        if (subtitle) items.push({ type: 'subtitle', title: textOf(subtitle), text: textOf(subtitle), el: subtitle });

        const synopsis = document.querySelector('.synopsis');
        if (synopsis) {
            items.push({ type: 'synopsis', title: 'Synopsis', text: textOf(synopsis), el: synopsis });
        }

        document.querySelectorAll('.main-chap .character-list li').forEach(li => {
            const name = li.querySelector('strong');
            const desc = li.querySelector('.muted') || li.querySelector('p');
            const title = name ? textOf(name) : textOf(li).slice(0, 60);
            items.push({ type: 'character', title, text: (textOf(name) + ' ' + textOf(desc)).trim(), el: li });
        });

        document.querySelectorAll('.seasons li').forEach(li => {
            items.push({ type: 'season', title: textOf(li), text: textOf(li), el: li });
        });

        let why = null;
        why = document.querySelector('.why-it-matters') || document.querySelector('section.why-it-matters');
        if (!why) {
            // перебираем все секции и ищем h2 с нужным текстом
            document.querySelectorAll('section').forEach(sec => {
                if (why) return;
                const h = sec.querySelector('h2');
                if (h && /Why it matters/i.test(h.textContent)) why = sec;
            });
        }
        if (why) items.push({ type: 'why', title: 'Why it matters', text: textOf(why), el: why });

        document.querySelectorAll('.sidebar .card, aside .card').forEach(card => {
            const h = card.querySelector('h3') || card.querySelector('strong') || card.querySelector('h2');
            const title = h ? textOf(h) : 'Quick card';
            items.push({ type: 'card', title, text: textOf(card), el: card });
        });

        document.querySelectorAll('.sidebar .card.small, .card.small, .suggestions-card').forEach(card => {
            items.push({ type: 'card-small', title: textOf(card.querySelector('h3') || card), text: textOf(card), el: card });
        });

        document.querySelectorAll('main p, main h2, main h3').forEach((el, i) => {
            if (i > 50) return; // safety cap
            const t = textOf(el);
            if (t && t.length > 0) {
                const title = (el.tagName.toLowerCase() === 'p' ? t.slice(0, 50) : t);
                items.push({ type: el.tagName.toLowerCase(), title, text: t, el });
            }
        });

        items.forEach((it, idx) => {
            if (it.el && !it.el.id) {
                it.el.id = `page-search-id-${idx}`;
            }
        });

        return items;
    }

    function ensureOrigHtml(els) {
        els.forEach(el => {
            if (!el.dataset.origHtml) el.dataset.origHtml = el.innerHTML;
        });
    }

    function restoreOrigHtml(els) {
        els.forEach(el => {
            if (el.dataset.origHtml) el.innerHTML = el.dataset.origHtml;
        });
    }

    function applyHighlight(query) {
        const q = (query || '').trim();
        const targets = Array.from(document.querySelectorAll('.anime-page, .sidebar, .content-grid, main'))
            .reduce((acc, root) => acc.concat(Array.from(root.querySelectorAll('h1,h2,h3,p,strong,li,span,dd,dt'))), [])
            .filter(el => textOf(el).length > 0);

        ensureOrigHtml(targets);

        if (!q) {
            restoreOrigHtml(targets);
            return;
        }
        const re = new RegExp('(' + escRegex(q) + ')', 'ig');

        targets.forEach(el => {
            const orig = el.dataset.origHtml || el.innerHTML;
            const replaced = orig.replace(re, '<mark class="search-highlight">$1</mark>');
            el.innerHTML = replaced;
        });
    }

    function applyFilter(query) {
        const q = (query || '').trim().toLowerCase();
        index.forEach(item => {
            const el = item.el;
            if (!el) return;
            const text = (item.text || '').toLowerCase();
            const shouldShow = !q || text.indexOf(q) !== -1;
            if (item.type === 'character' || item.type === 'season' || item.type === 'card' || item.type === 'card-small') {
                el.style.display = shouldShow ? '' : 'none';
            } else {
                el.style.display = '';
            }
        });
    }

    function showSuggestions(q) {
        const val = (q || '').trim().toLowerCase();
        suggestions.innerHTML = '';
        suggestions.style.display = 'none';
        suggestions.setAttribute('aria-hidden', 'true');

        if (!val) return;

        const matches = index
            .map(it => {
                const txt = (it.text || '').toLowerCase();
                const title = (it.title || '').toLowerCase();
                let score = 0;
                if (title.indexOf(val) !== -1) score += 20;
                if (txt.indexOf(val) !== -1) score += 10;
                score += Math.max(0, 5 - (txt.length / 200));
                return Object.assign({ score }, it);
            })
            .filter(it => it.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, MAX_SUGGEST);

        if (matches.length === 0) {
            const li = document.createElement('li');
            li.setAttribute('role', 'option');
            li.className = 'no-results';
            li.textContent = 'No results';
            suggestions.appendChild(li);
            suggestions.style.display = '';
            suggestions.setAttribute('aria-hidden', 'false');
            return;
        }

        matches.forEach(m => {
            const li = document.createElement('li');
            li.setAttribute('role', 'option');
            li.tabIndex = -1;
            li.dataset.targetId = m.el ? m.el.id : '';
            li.dataset.type = m.type;
            li.textContent = (m.title.length > 70) ? m.title.slice(0, 70) + '…' : m.title;
            suggestions.appendChild(li);
        });

        suggestions.style.display = '';
        suggestions.setAttribute('aria-hidden', 'false');
    }

    function scrollToEl(el) {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const offset = 80; // отступ от верха
        const top = window.pageYOffset + rect.top - offset;
        window.scrollTo({ top, behavior: 'smooth' });
        el.classList.add('page-search-flash');
        setTimeout(() => el.classList.remove('page-search-flash'), 1200);
    }

    function handleSuggestionKeys(e) {
        const visible = Array.from(suggestions.querySelectorAll('li')).filter(li => !li.classList.contains('no-results'));
        if (visible.length === 0) return;
        const active = suggestions.querySelector('li.active');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!active) visible[0].classList.add('active');
            else {
                active.classList.remove('active');
                const idx = visible.indexOf(active);
                visible[(idx + 1) % visible.length].classList.add('active');
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (!active) visible[visible.length - 1].classList.add('active');
            else {
                active.classList.remove('active');
                const idx = visible.indexOf(active);
                visible[(idx - 1 + visible.length) % visible.length].classList.add('active');
            }
        } else if (e.key === 'Enter') {
            if (active) {
                e.preventDefault();
                active.click();
            } else {
                if (visible[0]) visible[0].click();
                else {
                    applyFilter(input.value);
                    applyHighlight(input.value);
                    suggestions.style.display = 'none';
                }
            }
        } else if (e.key === 'Escape') {
            suggestions.style.display = 'none';
        }
    }

    function init() {
        index = buildIndex();
        const highlightTargets = Array.from(document.querySelectorAll('.anime-page, .sidebar, main'))
            .reduce((acc, root) => acc.concat(Array.from(root.querySelectorAll('h1,h2,h3,p,strong,li,span,dd,dt'))), [])
            .filter(el => textOf(el).length > 0);
        ensureOrigHtml(highlightTargets);
    }

    input.addEventListener('input', function () {
        const q = this.value;
        applyFilter(q);
        applyHighlight(q);
        showSuggestions(q);
    });

    input.addEventListener('keydown', handleSuggestionKeys);

    suggestions.addEventListener('click', function (e) {
        const li = e.target.closest('li');
        if (!li) return;
        if (li.classList.contains('no-results')) return;
        const targetId = li.dataset.targetId;
        const el = targetId ? document.getElementById(targetId) : null;
        input.value = li.textContent;
        applyFilter(input.value);
        applyHighlight(input.value);
        suggestions.style.display = 'none';
        if (el) scrollToEl(el);
    });

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.search-container')) {
            suggestions.style.display = 'none';
        }
    });

    const observerRoot = document.querySelector('main') || document.body;
    let timer = null;
    if (observerRoot) {
        const mo = new MutationObserver(() => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                init();
            }, 150);
        });
        mo.observe(observerRoot, { childList: true, subtree: true, characterData: true });
    }

    // старт
    init();

})();
