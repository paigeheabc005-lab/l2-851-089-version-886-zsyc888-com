
(function () {
  const qs = (s, root = document) => root.querySelector(s);
  const qsa = (s, root = document) => Array.from(root.querySelectorAll(s));

  function setActiveNav() {
    const path = location.pathname.split('/').pop() || 'index.html';
    qsa('[data-nav]').forEach((link) => {
      const target = link.getAttribute('href');
      if (target === path) link.classList.add('active');
    });
  }

  function setupMobileMenu() {
    const btn = qs('[data-mobile-menu]');
    const nav = qs('[data-nav-menu]');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => nav.classList.toggle('open'));
  }

  function setupBackToTop() {
    const btn = qs('[data-back-top]');
    if (!btn) return;
    const toggle = () => {
      if (window.scrollY > 700) btn.classList.add('show');
      else btn.classList.remove('show');
    };
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  function setupHeroSlider() {
    const slider = qs('[data-hero-slider]');
    if (!slider) return;
    const slides = qsa('.hero-slide', slider);
    const dotsWrap = qs('[data-slider-dots]', slider);
    const prev = qs('[data-slider-prev]', slider);
    const next = qs('[data-slider-next]', slider);
    if (!slides.length) return;

    let index = 0;
    const dots = slides.map((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'slider-dot';
      btn.type = 'button';
      btn.setAttribute('aria-label', `切换到第 ${i + 1} 张`);
      btn.addEventListener('click', () => show(i));
      dotsWrap && dotsWrap.appendChild(btn);
      return btn;
    });

    const show = (i) => {
      index = (i + slides.length) % slides.length;
      slides.forEach((slide, j) => slide.classList.toggle('active', j === index));
      dots.forEach((dot, j) => dot.classList.toggle('active', j === index));
      const slide = slides[index];
      if (slide && slide.dataset.cover) {
        slider.style.setProperty('--active-cover', `url('${slide.dataset.cover}')`);
      }
    };

    const step = (delta) => show(index + delta);

    prev && prev.addEventListener('click', () => step(-1));
    next && next.addEventListener('click', () => step(1));
    show(0);

    let timer = setInterval(() => step(1), 6000);
    slider.addEventListener('mouseenter', () => clearInterval(timer));
    slider.addEventListener('mouseleave', () => {
      timer = setInterval(() => step(1), 6000);
    });
  }

  function normalize(v) {
    return (v || '').toLowerCase().replace(/\s+/g, '');
  }

  function setupFilters() {
    qsa('[data-filter-form]').forEach((form) => {
      const input = qs('[data-filter-input]', form);
      const sort = qs('[data-filter-sort]', form);
      const clear = qs('[data-filter-clear]', form);
      const container = qs('[data-card-list]');
      if (!container) return;
      const cards = qsa('[data-card]', container);

      const apply = () => {
        const q = normalize(input ? input.value : '');
        const sortBy = sort ? sort.value : '';
        const visible = [];

        cards.forEach((card) => {
          const text = normalize([
            card.dataset.title,
            card.dataset.genre,
            card.dataset.region,
            card.dataset.type,
            card.dataset.tags,
            card.dataset.oneLine
          ].join(' '));
          const ok = !q || text.includes(q);
          card.classList.toggle('hidden', !ok);
          if (ok) visible.push(card);
        });

        if (sortBy) {
          visible.sort((a, b) => {
            const get = (el) => {
              if (sortBy === 'year') return Number(el.dataset.year || 0);
              if (sortBy === 'views') return Number(el.dataset.views || 0);
              if (sortBy === 'likes') return Number(el.dataset.likes || 0);
              if (sortBy === 'rating') return Number(el.dataset.rating || 0);
              return el.dataset.title || '';
            };
            const av = get(a);
            const bv = get(b);
            if (typeof av === 'number' && typeof bv === 'number') return bv - av;
            return String(av).localeCompare(String(bv), 'zh-Hans-CN');
          });
        }

        visible.forEach((card) => container.appendChild(card));
      };

      input && input.addEventListener('input', apply);
      sort && sort.addEventListener('change', apply);
      clear && clear.addEventListener('click', () => {
        if (input) input.value = '';
        if (sort) sort.value = '';
        apply();
      });
      apply();
    });
  }

  function setupPlayer() {
    const frame = qs('[data-player-frame]');
    if (!frame) return;
    const video = qs('video', frame);
    const poster = qs('[data-player-poster]', frame);
    const playBtn = qs('[data-play-toggle]', frame);
    if (!video) return;

    const src = video.dataset.src;
    let hls = null;

    const startPlayback = async () => {
      if (!src) return;
      if (video.readyState === 0) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else if (window.Hls && Hls.isSupported()) {
          if (!hls) {
            hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
          }
        } else {
          video.src = src;
        }
      }
      try {
        await video.play();
        frame.classList.add('is-playing');
        poster && poster.classList.add('hidden');
        playBtn && playBtn.classList.add('hidden');
      } catch (e) {}
    };

    const bind = (el) => {
      if (!el) return;
      el.addEventListener('click', (ev) => {
        ev.preventDefault();
        startPlayback();
      });
    };

    bind(playBtn);
    bind(poster);
    bind(frame);

    video.addEventListener('play', () => {
      frame.classList.add('is-playing');
      poster && poster.classList.add('hidden');
      playBtn && playBtn.classList.add('hidden');
    });
    video.addEventListener('pause', () => {
      if (!video.ended) {
        poster && poster.classList.remove('hidden');
        playBtn && playBtn.classList.remove('hidden');
      }
    });
    video.addEventListener('ended', () => {
      poster && poster.classList.remove('hidden');
      playBtn && playBtn.classList.remove('hidden');
      frame.classList.remove('is-playing');
    });

    const auto = qs('[data-player-auto]');
    if (auto) {
      startPlayback();
    }
  }

  function setupCopyLinks() {
    qsa('[data-copy-link]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const text = btn.getAttribute('data-copy-link') || '';
        try {
          await navigator.clipboard.writeText(text);
          const old = btn.textContent;
          btn.textContent = '已复制';
          setTimeout(() => (btn.textContent = old), 1400);
        } catch (e) {}
      });
    });
  }

  function init() {
    setActiveNav();
    setupMobileMenu();
    setupBackToTop();
    setupHeroSlider();
    setupFilters();
    setupPlayer();
    setupCopyLinks();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
