(() => {
    const API_BASE = 'https://api.jikan.moe/v4';
    const randomUrl = () => `${API_BASE}/random/anime`;
    const searchUrl = (q, page=1, limit=6) => `${API_BASE}/anime?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`;

    const randomBtn = document.getElementById('random-btn');
    const randomContainer = document.getElementById('random-anime');
    const searchInput = document.getElementById('api-search-input');
    const searchBtn = document.getElementById('api-search-btn');
    const resultsContainer = document.getElementById('api-results');
    const loadMoreBtn = document.getElementById('api-load-more');

    function esc(s = '') {
        return String(s)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }

    function truncate(text = '', n = 220) {
        if (!text) return '';
        return text.length > n ? text.slice(0, n).trim() + '…' : text;
    }

    async function safeFetch(url, { timeout = 9000, retries = 2, backoff = 300 } = {}) {
        for (let attempt = 0; attempt <= retries; attempt++) {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);
            try {
                const res = await fetch(url, { signal: controller.signal });
                clearTimeout(id);
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return await res.json();
            } catch (err) {
                clearTimeout(id);
                if (attempt === retries) {
                    throw err;
                }
                console.warn('[JIKAN] fetch attempt', attempt + 1, 'failed:', err);
                await new Promise(r => setTimeout(r, backoff * (attempt + 1)));
            }
        }
    }

    function createAnimeElement(item) {
        const d = item?.data || item;
        const title = esc(d.title || d.title_english || 'No title');
        const img = (d.images?.jpg?.image_url || d.images?.webp?.image_url || '').replace(/^http:/, 'https:');
        const synopsis = esc(truncate(d.synopsis || 'No synopsis available', 300));
        const score = d.score ? esc(String(d.score)) : '—';
        const url = esc(d.url || '#');

        const wrapper = document.createElement('article');
        wrapper.className = 'api-card';

        wrapper.innerHTML = `
      <a class="api-card-link" href="${url}" target="_blank" rel="noopener noreferrer">
        <div class="api-thumb" role="img" aria-label="${title}">
          <img src="${img || ''}" alt="${title}" loading="lazy" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=600 height=400><rect width=\\'100%\\' height=\\'100%\\' fill=\\'#0b1220\\'/><text x=\\'50%\\' y=\\'50%\\' fill=\\'#9fb7d8\\' font-family=\\'sans-serif\\' font-size=16 dominant-baseline=\\'middle\\' text-anchor=\\'middle\\'>Image not available</text></svg>';">
        </div>
        <div class="api-body">
          <h3 class="api-title">${title}</h3>
          <p class="api-synopsis">${synopsis}</p>
          <div class="api-meta">Score: <strong>${score}</strong></div>
        </div>
      </a>
    `;
        return wrapper;
    }

    async function loadRandomAnime() {
        if (!randomContainer) return;
        randomContainer.innerHTML = `<div class="api-loading">Loading…</div>`;
        try {
            const json = await safeFetch(randomUrl(), { timeout: 9000, retries: 1 });
            randomContainer.innerHTML = '';
            randomContainer.appendChild(createAnimeElement(json));
        } catch (err) {
            console.warn('[JIKAN] request failed', err);
            resultsContainer.innerHTML = '<div class="api-error">Сеть или API недоступно — попробуйте позже.</div>';
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        }

    }

    let currentQuery = '';
    let currentPage = 1;
    const PER_PAGE = 6;

    async function runSearch(q, page = 1) {
        if (!resultsContainer) return;
        if (!q || !q.trim()) {
            resultsContainer.innerHTML = `<div class="api-hint">Введите запрос для поиска аниме.</div>`;
            loadMoreBtn.style.display = 'none';
            return;
        }
        if (page === 1) {
            resultsContainer.innerHTML = `<div class="api-loading">Searching…</div>`;
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.disabled = true;
            loadMoreBtn.textContent = 'Loading…';
        }

        try {
            const json = await safeFetch(searchUrl(q, page, PER_PAGE), { timeout: 9000, retries: 1 });
            const results = json?.data || [];
            if (page === 1) resultsContainer.innerHTML = '';
            if (!results.length && page === 1) {
                resultsContainer.innerHTML = `<div class="api-empty">No results.</div>`;
                loadMoreBtn.style.display = 'none';
                return;
            }

            results.forEach(item => {
                const el = createAnimeElement(item);
                resultsContainer.appendChild(el);
            });

            if (results.length === PER_PAGE) {
                loadMoreBtn.style.display = 'inline-block';
                loadMoreBtn.disabled = false;
                loadMoreBtn.textContent = 'Load more';
            } else {
                loadMoreBtn.style.display = 'none';
            }
        } catch (err) {
            console.warn('[JIKAN] request failed', err);
            resultsContainer.innerHTML = '<div class="api-error">Сеть или API недоступно — попробуйте позже.</div>';
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        }
        finally {
            if (page === 1) {}
            else { loadMoreBtn.disabled = false; loadMoreBtn.textContent = 'Load more'; }
        }
    }

    function debounce(fn, ms = 300) {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn(...args), ms);
        };
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadRandomAnime();

        if (randomBtn) {
            randomBtn.addEventListener('click', () => {
                randomBtn.disabled = true;
                randomBtn.textContent = 'Loading…';
                loadRandomAnime().finally(() => {
                    randomBtn.disabled = false;
                    randomBtn.textContent = 'Surprise me';
                });
            });
        }

        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => {
                currentQuery = searchInput.value.trim();
                currentPage = 1;
                runSearch(currentQuery, currentPage);
            });

            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    searchBtn.click();
                }
            });

            searchInput.addEventListener('input', debounce(() => {
                const q = searchInput.value.trim();
                if (!q) return;
                if (q.length >= 3) {
                    currentQuery = q;
                    currentPage = 1;
                    runSearch(currentQuery, currentPage);
                }
            }, 450));
        }

        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                currentPage += 1;
                runSearch(currentQuery, currentPage);
            });
        }
    });

})();
