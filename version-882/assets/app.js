
(function () {
  const sample = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function initCarousel() {
    const carousel = document.querySelector("[data-carousel]");
    if (!carousel) return;

    const slides = sample("[data-slide]", carousel);
    const dots = sample("[data-dot]", carousel);
    const prev = carousel.querySelector("[data-prev]");
    const next = carousel.querySelector("[data-next]");
    if (!slides.length) return;

    let index = 0;
    let timer = null;
    let paused = false;

    const render = () => {
      slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
      dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
    };

    const goTo = (i) => {
      index = (i + slides.length) % slides.length;
      render();
    };

    const play = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        if (!paused) goTo(index + 1);
      }, 5500);
    };

    prev && prev.addEventListener("click", () => goTo(index - 1));
    next && next.addEventListener("click", () => goTo(index + 1));
    dots.forEach((dot, i) => dot.addEventListener("click", () => goTo(i)));

    carousel.addEventListener("mouseenter", () => (paused = true));
    carousel.addEventListener("mouseleave", () => (paused = false));
    carousel.addEventListener("touchstart", () => (paused = true), { passive: true });
    carousel.addEventListener("touchend", () => (paused = false), { passive: true });

    goTo(0);
    play();
  }

  function initSearchFilter() {
    sample("[data-search-input]").forEach((input) => {
      const targetSelector = input.getAttribute("data-search-target");
      const emptyMsg = targetSelector ? document.querySelector(targetSelector)?.querySelector("[data-empty]") : null;
      const cards = targetSelector ? sample("[data-search-item]", document.querySelector(targetSelector)) : [];

      const filter = () => {
        const q = input.value.trim().toLowerCase();
        let shown = 0;
        cards.forEach((card) => {
          const hay = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          const hit = !q || hay.includes(q);
          card.classList.toggle("is-hidden", !hit);
          if (hit) shown += 1;
        });
        if (emptyMsg) {
          emptyMsg.classList.toggle("is-hidden", shown > 0 || !q);
        }
      };

      input.addEventListener("input", filter);
      filter();
    });
  }

  function initFilterPills() {
    sample("[data-filter-group]").forEach((group) => {
      const pills = sample("[data-filter]", group);
      const targetSelector = group.getAttribute("data-filter-target");
      const target = targetSelector ? document.querySelector(targetSelector) : null;
      const cards = target ? sample("[data-filter-item]", target) : [];
      if (!cards.length) return;

      const update = (filterValue) => {
        cards.forEach((card) => {
          const kind = (card.getAttribute("data-kind") || "").toLowerCase();
          const match = filterValue === "all" || kind.includes(filterValue);
          card.classList.toggle("is-hidden", !match);
        });
      };

      pills.forEach((pill) => {
        pill.addEventListener("click", () => {
          pills.forEach((p) => p.classList.remove("active"));
          pill.classList.add("active");
          update((pill.getAttribute("data-filter") || "all").toLowerCase());
        });
      });

      update((group.getAttribute("data-default-filter") || "all").toLowerCase());
    });
  }

  function initVideoPlayers() {
    sample("[data-player]").forEach((player) => {
      const video = player.querySelector("video");
      if (!video) return;
      const overlay = player.querySelector("[data-play-overlay]");
      const buttons = sample("[data-source]", player);
      let hls = null;

      const destroyHls = () => {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      };

      const loadSource = (src) => {
        if (!src) return;
        destroyHls();
        const isM3u8 = /\.m3u8(\?.*)?$/i.test(src);
        const canNativeHls = video.canPlayType("application/vnd.apple.mpegurl");
        if (isM3u8 && window.Hls && window.Hls.isSupported() && !canNativeHls) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 30,
          });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }

        buttons.forEach((btn) => {
          btn.classList.toggle("active", btn.getAttribute("data-source") === src);
        });
      };

      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          loadSource(btn.getAttribute("data-source"));
          video.play().catch(() => {});
        });
      });

      overlay && overlay.addEventListener("click", () => video.play().catch(() => {}));

      video.addEventListener("play", () => {
        if (overlay) overlay.classList.add("is-hidden");
      });

      video.addEventListener("pause", () => {
        if (overlay) overlay.classList.remove("is-hidden");
      });

      const first = buttons[0];
      if (first) loadSource(first.getAttribute("data-source"));

      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    });
  }

  function initScrollTop() {
    sample("[data-scroll-top]").forEach((btn) => {
      btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initCarousel();
    initSearchFilter();
    initFilterPills();
    initVideoPlayers();
    initScrollTop();
  });
})();
