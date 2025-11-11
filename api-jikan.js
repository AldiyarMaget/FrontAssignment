(() => {
    const API = 'https://api.jikan.moe/v4';
    const RANDOM = () => `${API}/random/anime`;
    const DEFAULT_BTN_TEXT = 'Surprise me';

    const randomBtn = document.getElementById('random-btn');
    const randomContainer = document.getElementById('random-anime');

    const truncate = (s = '', n = 320) => (s.length > n ? s.slice(0, n).trim() + '…' : s);
    const makePlaceholder = (label = 'Image') => {
        const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='100%' height='100%' fill='#0b1220'/><text x='50%' y='50%' fill='#9fb7d8' font-family='sans-serif' font-size='16' dominant-baseline='middle' text-anchor='middle'>${label} — no image</text></svg>`;
        return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    };

    async function fetchJsonWithTimeout(url, timeout = 9000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        try {
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(id);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return await res.json();
        } finally {
            clearTimeout(id);
        }
    }

    function buildCard(data) {
        const d = (data && data.data) ? data.data : (data || {});
        const title = d.title || d.title_english || 'No title';
        const synopsis = truncate(d.synopsis || 'No synopsis available', 360);
        const score = d.score != null ? String(d.score) : '—';
        const url = d.url || '#';
        const imgSrc = d.images?.jpg?.image_url || d.images?.webp?.image_url || '';

        const article = document.createElement('article');
        article.className = 'api-card';

        const a = document.createElement('a');
        a.className = 'api-card-link';
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';

        const thumb = document.createElement('div');
        thumb.className = 'api-thumb';
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.alt = title;
        img.decoding = 'async';
        img.src = imgSrc || makePlaceholder(title);
        img.addEventListener('error', () => {
            img.src = makePlaceholder(title);
            thumb.classList.add('no-thumb');
        });
        thumb.appendChild(img);

        const body = document.createElement('div');
        body.className = 'api-body';

        const h3 = document.createElement('h3');
        h3.className = 'api-title';
        h3.textContent = title;

        const p = document.createElement('p');
        p.className = 'api-synopsis';
        p.textContent = synopsis;

        const meta = document.createElement('div');
        meta.className = 'api-meta';
        meta.textContent = 'Score: ' + score;

        body.appendChild(h3);
        body.appendChild(p);
        body.appendChild(meta);

        a.appendChild(thumb);
        a.appendChild(body);
        article.appendChild(a);

        return article;
    }

    async function renderRandom() {
        if (!randomContainer) return;
        randomContainer.innerHTML = '<div class="api-loading">Loading…</div>';
        try {
            const json = await fetchJsonWithTimeout(RANDOM(), 9000);
            randomContainer.innerHTML = '';
            randomContainer.appendChild(buildCard(json));
        } catch (err) {
            console.warn('[JIKAN] random load failed', err);
            randomContainer.innerHTML = '<div class="api-error">Не удалось загрузить аниме. Попробуйте ещё раз.</div>';
        }
    }

    function setBtnLoading(isLoading) {
        if (!randomBtn) return;
        randomBtn.disabled = isLoading;
        randomBtn.textContent = isLoading ? 'Loading…' : DEFAULT_BTN_TEXT;
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!randomContainer) {
            console.warn('[JIKAN] #random-anime not found — aborting random init');
            return;
        }
        renderRandom();

        if (randomBtn) {
            randomBtn.addEventListener('click', () => {
                setBtnLoading(true);
                renderRandom().finally(() => setBtnLoading(false));
            });
        } else {
            console.info('[JIKAN] #random-btn not found — button disabled');
        }
    });
})();
