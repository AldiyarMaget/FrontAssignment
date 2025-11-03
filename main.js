const contactBtn = document.getElementById('contact-toggle');
const contactWindow = document.getElementById('form-window');
const contactClose = document.getElementById('close-btn');
const accordionHeaders = document.querySelectorAll('.faq-question');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const messageInput = document.getElementById('message');
const formValidationMessage = document.getElementById('form-validation-message');

contactWindow.addEventListener('submit', function(event) {
    event.preventDefault();
    const btn = document.getElementById('submitBtn')
    formValidationMessage.textContent = '';
    if (nameInput.value.trim() === '' || emailInput.value.trim() === '' || messageInput.value.trim() === '') {
        
        formValidationMessage.textContent = 'Заполните все поля формы.';
        formValidationMessage.style.color = 'red';
        $('.validation-message').fadeIn(400).delay(2000).fadeOut(400)
        return;
    }
    else {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner">⏳</span> Please wait...';
      setTimeout(() => {
    btn.disabled = false;
    btn.textContent = 'Send';
    formValidationMessage.textContent = 'Форма принята!';
    formValidationMessage.style.color = 'green';
    $('.validation-message').fadeIn(400).delay(2000).fadeOut(400)
  }, 2000);
}
});



accordionHeaders.forEach(header => {
  header.addEventListener('click', () => {
    const content = header.nextElementSibling;

    header.classList.toggle('active');

    if (header.classList.contains('active')) {
      content.style.maxHeight = content.scrollHeight + 'px';
    } else {
      content.style.maxHeight = 0;
    }

    accordionHeaders.forEach(otherHeader => {
      if (otherHeader !== header) {
        otherHeader.classList.remove('active');
        otherHeader.nextElementSibling.style.maxHeight = 0;
      }
    });
  });
});


contactBtn.addEventListener('click', () => {
  contactWindow.style.display = 'flex';
});
contactClose.addEventListener('click', () => {
  contactWindow.style.display = 'none';
});
window.addEventListener('click', (event) => {
  if (event.target === contactWindow) {
    contactWindow.style.display = 'none';
  }
});


(function() {
    const btn = document.getElementById('bg-btn');
    if (!btn) return;

    const colors = [
        '#071023',
        '#0f1724',
        '#082032',
        '#1b2430',
        '#f5efe6',
        '#083a70'
    ];

    let index = 0;
    try {
        const saved = localStorage.getItem('bgColorIndex');
        if (saved !== null && !isNaN(Number(saved))) index = Number(saved) % colors.length;
    } catch (e) {
    }

    function applyColor(i) {
        const root = document.documentElement;
        const color = colors[i % colors.length];
        root.style.setProperty('--bg', color);
        try { localStorage.setItem('bgColorIndex', String(i % colors.length)); } catch (e) {}
    }

    applyColor(index);

    btn.addEventListener('click', () => {
        index = (index + 1) % colors.length;
        applyColor(index);
        btn.setAttribute('aria-pressed', index % 2 === 1 ? 'true' : 'false');
    });
})();

(function() {
    const el = document.getElementById('date-time');
    if (!el) return;

    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };
    function formatDateTime(dt) {
        try {
            return dt.toLocaleString('en-US', options);
        } catch (e) {
            const year = dt.getFullYear();
            const month = dt.toLocaleString('en-US', { month: 'long' });
            const day = dt.getDate();
            let hours = dt.getHours();
            const minutes = String(dt.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            return `${month} ${day}, ${year}, ${hours}:${minutes} ${ampm}`;
        }
    }
    function update() {
        const now = new Date();
        el.textContent = formatDateTime(now);
    }
    update();
    const timer = setInterval(update, 1000);
    window.addEventListener('beforeunload', () => clearInterval(timer));
})();

$(document).ready(function(){
    console.log("jQuery is ready!");
});

$(function (){
    const piska = $('.piska').hide().text('киря мальенкая писька🤏').show(5000).hide(50000);
    $('.nav-wrap').hide().show(1000);
});

$(function () {
    function huinaRegul(string) {
        return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
    }

    $(function () {
        const $input = $('#search-input');
        const $suggest = $('#suggestions');
        const maxSuggestions = 6;

        function buildIndex() {
            const items = [];
            $('.card').each(function () {
                const $card = $(this);
                const title = $.trim($card.find('h3').text());
                const desc = $.trim($card.find('.muted').text() || '');
                const text = (title + ' ' + desc).replace(/\s+/g, ' ').trim();
                if (text) items.push({ type: 'card', text, title, el: $card });
            });
            $('.faq-question').each(function () {
                const $q = $(this);
                const text = $.trim($q.text());
                if (text) items.push({ type: 'faq', text, title: text, el: $q });
            });
            $('.caption-text').each(function () {
                const $c = $(this);
                const text = $.trim($c.text());
                if (text) items.push({ type: 'gallery', text, title: text, el: $c.closest('.gallery-item') });
            });
            return items;
        }

        let index = buildIndex();

        function ensureOrig(elem) {
            elem.each(function () {
                const $el = $(this);
                if (!$el.data('origHtml')) $el.data('origHtml', $el.html());
            });
        }
        const $highlightTargets = $(
            '.card .card-content h3, .card .card-content .muted, .faq-question, .faq .answer, .hero-title, .gallery-item .caption-text'
        );
        ensureOrig($highlightTargets);

        function applyHighlight(query) {
            if (!query) {
                $highlightTargets.each(function () {
                    const $el = $(this);
                    const orig = $el.data('origHtml') || $el.html();
                    $el.html(orig);
                });
                return;
            }
            const re = new RegExp('(' + huinaRegul(query) + ')', 'ig');
            $highlightTargets.each(function () {
                const $el = $(this);
                const orig = $el.data('origHtml') || $el.html();
                const replaced = orig.replace(re, '<mark class="search-highlight">$1</mark>');
                $el.html(replaced);
            });
        }

        function applyFilter(query) {
            const q = (query || '').trim().toLowerCase();
            $('.card').each(function () {
                const $c = $(this);
                const text = ($.trim($c.find('h3').text() + ' ' + $c.find('.muted').text())).toLowerCase();
                const show = !q || text.indexOf(q) !== -1;
                $c.toggle(show);
            });
            $('.faq-question').each(function () {
                const $q = $(this);
                const text = $.trim($q.text()).toLowerCase();
                const answer = $.trim($q.next('.answer').text()).toLowerCase();
                const show = !q || text.indexOf(q) !== -1 || answer.indexOf(q) !== -1;
                $q.toggle(show);
                $q.next('.answer').toggle(show);
            });
            $('.gallery-item').each(function () {
                const $g = $(this);
                const caption = $.trim($g.find('.caption-text').text()).toLowerCase();
                const show = !q || caption.indexOf(q) !== -1;
                $g.toggle(show);
            });
        }

        function showSuggestions(val) {
            const q = (val || '').trim().toLowerCase();
            if (!q) {
                $suggest.hide().attr('aria-hidden', 'true').empty();
                return;
            }
            index = buildIndex();
            const matches = [];
            for (let i = 0; i < index.length && matches.length < maxSuggestions; i++) {
                const it = index[i];
                if (it.text.toLowerCase().indexOf(q) !== -1) {
                    matches.push(it);
                }
            }
            if (matches.length === 0) {
                $suggest.hide().attr('aria-hidden', 'true').empty();
                return;
            }
            $suggest.empty();
            matches.forEach(function (m) {
                const $li = $('<li role="option"></li>').text(m.title).data('targetType', m.type).data('targetText', m.text);
                $suggest.append($li);
            });
            $suggest.show().attr('aria-hidden', 'false');
        }

        $input.on('input', function () {
            const val = $(this).val();
            applyFilter(val);
            applyHighlight(val);
            showSuggestions(val);
        });

        $input.on('keydown', function (e) {
            const $visible = $suggest.find('li:visible');
            const $active = $visible.filter('.active');
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if ($active.length === 0) $visible.first().addClass('active');
                else {
                    const $next = $active.removeClass('active').nextAll('li:visible').first();
                    ($next.length ? $next : $visible.first()).addClass('active');
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if ($active.length === 0) $visible.last().addClass('active');
                else {
                    const $prev = $active.removeClass('active').prevAll('li:visible').first();
                    ($prev.length ? $prev : $visible.last()).addClass('active');
                }
            } else if (e.key === 'Enter') {
                const val = $(this).val();
                if ($active.length > 0) {
                    e.preventDefault();
                    $active.trigger('click');
                } else {
                    applyFilter(val);
                    applyHighlight(val);
                    $suggest.hide().attr('aria-hidden', 'true');
                }
            } else if (e.key === 'Escape') {
                $suggest.hide().attr('aria-hidden', 'true');
            }
        });

        $suggest.on('click', 'li', function () {
            const text = $(this).text();
            $input.val(text).focus();
            applyFilter(text);
            applyHighlight(text);
            $suggest.hide().attr('aria-hidden', 'true');
        });

        $(document).on('click', function (e) {
            if (!$(e.target).closest('.search-container').length) {
                $suggest.hide().attr('aria-hidden', 'true');
            }
        });

        observe(document.querySelector('main'), { childList: true, subtree: true, characterData: true });

    });
});

(function($){
    'use strict';

    $(function(){
        $(function(){

            let $bar = $('#scroll-progress-bar');
            let $track = $('#scroll-progress');
            if (!$bar.length || !$track.length) return;

            function findScroller() {
                let candidates = [
                    document.scrollingElement,
                    document.documentElement,
                    document.body,
                    $('.page-layout').get(0),
                    $('main').get(0)
                ].filter(Boolean);

                for (let i = 0; i < candidates.length; i++) {
                    let el = candidates[i];
                    if (el === window) continue;
                    if (el.scrollHeight > el.clientHeight + 1) return el;
                }
                return window;
            }

            let scroller = findScroller();

            function getScrollInfo() {
                if (scroller === window) {
                    let doc = document.documentElement;
                    let scrollTop = window.pageYOffset || doc.scrollTop || 0;
                    let total = Math.max(doc.scrollHeight - window.innerHeight, 0);
                    return { scrollTop: scrollTop, total: total };
                } else {
                    let el = scroller;
                    return { scrollTop: el.scrollTop, total: Math.max(el.scrollHeight - el.clientHeight, 0) };
                }
            }

            function update() {
                let info = getScrollInfo();
                let pct = info.total > 0 ? Math.round((info.scrollTop / info.total) * 100) : 0;
                let visual = info.total > 0 ? Math.max(2, pct) : 2;
                $bar.css('width', visual + '%').attr('aria-valuenow', String(pct));
            }

            let raf = null;
            function onScroll() {
                if (raf) return;
                raf = requestAnimationFrame(function () {
                    update();
                    raf = null;
                });
            }

            try {
                let target = (scroller === window ? window : scroller);
                target.addEventListener('scroll', function(){
                    onScroll();
                }, { passive: true });
                window.addEventListener('resize', onScroll, { passive: true });
            } catch (err) {
                let $t = (scroller === window ? $(window) : $(scroller));
                $t.on('scroll', onScroll);
                $(window).on('resize', onScroll);
            }

            update();
            $(window).on('load', update);
            setTimeout(update, 150);
            setTimeout(update, 800);

        });
        $(function(){

            let $counters = $('.stat-number[data-target]');
            if (!$counters.length) return;

            function fmt(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

            function animateCount($el, to, duration){
                if ($el.data('counted')) return;
                duration = typeof duration === 'number' ? duration : 1200;
                let startTime = null;
                let from = Number(String($el.text()).replace(/[^0-9.-]/g,'')) || 0;
                let delta = to - from;

                function step(ts){
                    if (!startTime) startTime = ts;
                    let t = Math.min(1, (ts - startTime) / duration);
                    let eased = 1 - Math.pow(1 - t, 3);
                    let cur = Math.round(from + delta * eased);
                    $el.text(fmt(cur));
                    if (t < 1) requestAnimationFrame(step);
                    else {
                        $el.text(fmt(to));
                        $el.data('counted', true);
                    }
                }
                requestAnimationFrame(step);
            }

            function runAllCounters(){
                $counters.each(function(){
                    let $n = $(this);
                    if ($n.data('counted')) return;
                    let target = Number($n.attr('data-target')) || 0;
                    let dur = 1100 + Math.floor(Math.random() * 700);
                    animateCount($n, target, dur);
                });
            }

            let $statsSection = $('.stats-section').first();

            if (window.IntersectionObserver && $statsSection.length) {
                let obs = new IntersectionObserver(function(entries, observer){
                    for (let i = 0; i < entries.length; i++) {
                        let entry = entries[i];
                        if (entry.isIntersecting) {
                            runAllCounters();
                            observer.disconnect();
                            break;
                        }
                    }
                }, { threshold: 0.3 });
                obs.observe($statsSection.get(0));
            } else {
                let anyInView = false;
                let winH = window.innerHeight || document.documentElement.clientHeight;
                $counters.each(function(){
                    let r = this.getBoundingClientRect();
                    if (r.top < winH && r.bottom > 0) { anyInView = true; return false; }
                });

                if (anyInView) {
                    $counters.each(function(){
                        let $n = $(this);
                        if ($n.data('counted')) return;
                        let r = this.getBoundingClientRect();
                        if (r.top < winH && r.bottom > 0) {
                            animateCount($n, Number($n.attr('data-target')) || 0, 1100 + Math.floor(Math.random()*700));
                        }
                    });
                } else {
                    runAllCounters();
                }
            }
            $(window).on('load', function(){ runAllCounters(); });
        });
    });
})(jQuery);

(function() {
  const root = document.documentElement;
  const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, li, span, strong, .muted, .subtitle, .answer');

  function isLightColor(color) {
    const rgb = color.match(/\d+/g);
    if (!rgb) return false;
    const [r, g, b] = rgb.map(Number);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 160;
  }

  function adjustTextColor() {
    const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
    if (!bg) return;
    const temp = document.createElement('div');
    temp.style.color = bg;
    document.body.appendChild(temp);
    const bgColor = getComputedStyle(temp).color;
    document.body.removeChild(temp);

    const isLight = isLightColor(bgColor);
    textElements.forEach(el => {
      el.style.color = isLight ? '#111' : '';
    });
  }

  const observer = new MutationObserver(adjustTextColor);
  observer.observe(root, { attributes: true, attributeFilter: ['style'] });

  adjustTextColor();
})();
