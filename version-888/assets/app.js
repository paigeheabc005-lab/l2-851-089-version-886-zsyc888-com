
(function () {
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const $ = (sel, root = document) => root.querySelector(sel);

  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function cardTemplate(m, compact = true) {
    const tags = (m.tags || []).slice(0, 3).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
    return `
      <article class="movie-card ${compact ? "compact" : ""}" style="--c1:${m.c1};--c2:${m.c2};--c3:${m.c3};">
        <a class="movie-link" href="movie/${m.id}.html">
          <div class="poster">
            <div class="poster-top">
              <span class="chip">${escapeHtml(m.type)}</span>
              <span class="chip ghost">${escapeHtml(m.year)}</span>
            </div>
            <div class="poster-body">
              <h3>${escapeHtml(m.title)}</h3>
              <p>${escapeHtml(m.one_line)}</p>
            </div>
            <div class="poster-meta">
              <span>${escapeHtml(m.region)}</span>
              <span>${escapeHtml(m.genre)}</span>
            </div>
          </div>
        </a>
        <div class="card-content">
          <div class="card-meta">
            <span>${escapeHtml(m.region)}</span>
            <span>${escapeHtml(m.year)}</span>
            <span>${escapeHtml(m.genre)}</span>
          </div>
          <h3><a href="movie/${m.id}.html">${escapeHtml(m.title)}</a></h3>
          <p>${escapeHtml(m.one_line)}</p>
          <div class="tag-row">${tags}</div>
        </div>
      </article>
    `;
  }

  function initMenu() {
    const toggle = $('[data-menu-toggle]');
    const nav = $('[data-site-nav]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
    document.addEventListener('click', (ev) => {
      if (!nav.contains(ev.target) && !toggle.contains(ev.target)) {
        nav.classList.remove('open');
      }
    });
  }

  function initToTop() {
    const btn = $('[data-to-top]');
    if (!btn) return;
    const sync = () => {
      if (window.scrollY > 320) btn.classList.add('visible');
      else btn.classList.remove('visible');
    };
    window.addEventListener('scroll', sync, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    sync();
  }

  function initHeroCarousel() {
    const stage = $('.hero-stage');
    const slides = $$('.hero-slide', stage || document);
    const dotsWrap = $('[data-hero-dots]');
    if (!stage || slides.length <= 1) return;
    let index = 0;
    const dots = [];
    slides.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'hero-dot' + (i === 0 ? ' active' : '');
      btn.type = 'button';
      btn.addEventListener('click', () => {
        index = i;
        show();
      });
      dotsWrap && dotsWrap.appendChild(btn);
      dots.push(btn);
    });
    function show() {
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    }
    show();
    setInterval(() => {
      index = (index + 1) % slides.length;
      show();
    }, 5000);
  }

  function initSearchPage() {
    const results = $('.search-results');
    if (!results || !Array.isArray(window.MOVIE_DATA)) return;

    const queryInput = $('[data-query]');
    const typeSel = $('[data-type]');
    const genreSel = $('[data-genre]');
    const regionSel = $('[data-region]');
    const yearSel = $('[data-year]');
    const sortSel = $('[data-sort]');
    const countEl = $('[data-count]');
    const pageSize = Number(results.dataset.pageSize || 24);
    const pager = $('[data-pager]');
    const params = new URLSearchParams(location.search);

    const unique = (key) => Array.from(new Set(window.MOVIE_DATA.map((m) => m[key]).filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b), 'zh-Hans-CN'));
    function fillSelect(sel, values, placeholder) {
      if (!sel) return;
      if (sel.options.length <= 1) {
        sel.innerHTML = `<option value="">${placeholder}</option>` + values.map((v) => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('');
      }
    }

    fillSelect(typeSel, unique('type'), '全部类型');
    fillSelect(genreSel, Array.from(new Set(window.MOVIE_DATA.flatMap((m) => (m.genre || '').split(/[、,\/\s]+/).filter(Boolean)))), '全部题材');
    fillSelect(regionSel, unique('region'), '全部地区');
    fillSelect(yearSel, unique('year').sort((a, b) => Number(b) - Number(a)), '全部年份');

    if (queryInput) queryInput.value = params.get('q') || '';
    if (typeSel) typeSel.value = params.get('type') || '';
    if (genreSel) genreSel.value = params.get('genre') || '';
    if (regionSel) regionSel.value = params.get('region') || '';
    if (yearSel) yearSel.value = params.get('year') || '';
    if (sortSel) sortSel.value = params.get('sort') || 'latest';

    let currentPage = Math.max(1, Number(params.get('page') || 1));

    function filterData() {
      const q = (queryInput?.value || '').trim().toLowerCase();
      const type = typeSel?.value || '';
      const genre = genreSel?.value || '';
      const region = regionSel?.value || '';
      const year = yearSel?.value || '';
      const sort = sortSel?.value || 'latest';

      let arr = window.MOVIE_DATA.slice();
      if (q) {
        arr = arr.filter((m) => {
          const hay = [
            m.title, m.region, m.type, m.year, m.genre, m.one_line,
            ...(m.tags || [])
          ].join(' ').toLowerCase();
          return hay.includes(q);
        });
      }
      if (type) arr = arr.filter((m) => m.type === type);
      if (region) arr = arr.filter((m) => m.region === region);
      if (year) arr = arr.filter((m) => String(m.year) === String(year));
      if (genre) arr = arr.filter((m) => (m.genre || '').split(/[、,\/\s]+/).includes(genre));

      if (sort === 'heat') arr.sort((a, b) => b.heat - a.heat || Number(b.year) - Number(a.year));
      else if (sort === 'title') arr.sort((a, b) => a.title.localeCompare(b.title, 'zh-Hans-CN'));
      else if (sort === 'year') arr.sort((a, b) => Number(b.year) - Number(a.year) || b.heat - a.heat);
      else arr.sort((a, b) => Number(b.year) - Number(a.year) || b.heat - a.heat);

      return arr;
    }

    function syncUrl(page = 1) {
      const url = new URL(location.href);
      const set = (k, el) => {
        if (!el) return;
        const v = el.value;
        if (v) url.searchParams.set(k, v);
        else url.searchParams.delete(k);
      };
      set('q', queryInput);
      set('type', typeSel);
      set('genre', genreSel);
      set('region', regionSel);
      set('year', yearSel);
      set('sort', sortSel);
      if (page > 1) url.searchParams.set('page', String(page));
      else url.searchParams.delete('page');
      history.replaceState({}, '', url);
    }

    function render() {
      const data = filterData();
      const total = data.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      currentPage = Math.min(currentPage, totalPages);
      const start = (currentPage - 1) * pageSize;
      const chunk = data.slice(start, start + pageSize);
      results.innerHTML = chunk.map((m) => cardTemplate(m)).join('');
      if (countEl) countEl.textContent = `共 ${total} 条结果，第 ${currentPage} / ${totalPages} 页`;
      if (pager) {
        const prev = currentPage > 1 ? `<a href="#" data-page="${currentPage - 1}">上一页</a>` : `<span>上一页</span>`;
        const next = currentPage < totalPages ? `<a href="#" data-page="${currentPage + 1}">下一页</a>` : `<span>下一页</span>`;
        let numbers = '';
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        if (startPage > 1) numbers += `<a href="#" data-page="1">1</a><span>…</span>`;
        for (let p = startPage; p <= endPage; p++) {
          numbers += p === currentPage ? `<span class="current">${p}</span>` : `<a href="#" data-page="${p}">${p}</a>`;
        }
        if (endPage < totalPages) numbers += `<span>…</span><a href="#" data-page="${totalPages}">${totalPages}</a>`;
        pager.innerHTML = prev + numbers + next;
        $$('#data-pager a[data-page]', pager).forEach((a) => a.addEventListener('click', (ev) => {
          ev.preventDefault();
          currentPage = Number(a.dataset.page || 1);
          syncUrl(currentPage);
          render();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }));
      }
      syncUrl(currentPage);
    }

    const resetBtn = $('[data-reset]');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (queryInput) queryInput.value = '';
        if (typeSel) typeSel.value = '';
        if (genreSel) genreSel.value = '';
        if (regionSel) regionSel.value = '';
        if (yearSel) yearSel.value = '';
        if (sortSel) sortSel.value = 'latest';
        currentPage = 1;
        render();
      });
    }

    [queryInput, typeSel, genreSel, regionSel, yearSel, sortSel].forEach((el) => {
      if (!el) return;
      el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', () => {
        currentPage = 1;
        render();
      });
    });

    render();
  }

  function initVideoPlayers() {
    $$('video[data-hls-src]').forEach((video) => {
      const src = video.getAttribute('data-hls-src');
      if (!src) return;
      if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
        const hls = new window.Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (src.endsWith('.m3u8')) {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        s.onload = () => {
          if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
          } else {
            video.src = src;
          }
        };
        document.head.appendChild(s);
      } else {
        video.src = src;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    initToTop();
    initHeroCarousel();
    initSearchPage();
    initVideoPlayers();
  });
})();
