(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupHeader() {
    var header = qs('[data-site-header]');
    var toggle = qs('[data-mobile-toggle]');
    var menu = qs('[data-mobile-menu]');
    var backTop = qs('[data-back-top]');

    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('is-open');
      });
    }

    function onScroll() {
      var active = window.scrollY > 40;
      if (header) {
        header.classList.toggle('is-scrolled', active);
      }
      if (backTop) {
        backTop.classList.toggle('is-visible', window.scrollY > 520);
      }
    }

    if (backTop) {
      backTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function setupCarousel() {
    qsa('[data-carousel]').forEach(function (carousel) {
      var slides = qsa('[data-slide]', carousel);
      var dots = qsa('[data-carousel-dot]', carousel);
      var prev = qs('[data-carousel-prev]', carousel);
      var next = qs('[data-carousel-next]', carousel);
      var index = 0;
      var timer = null;

      if (!slides.length) {
        return;
      }

      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5600);
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          restart();
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          restart();
        });
      });

      show(0);
      restart();
    });
  }

  function setupFilters() {
    qsa('[data-filter-panel]').forEach(function (panel) {
      var input = qs('[data-filter-input]', panel);
      var year = qs('[data-filter-year]', panel);
      var region = qs('[data-filter-region]', panel);
      var type = qs('[data-filter-type]', panel);
      var cards = qsa('[data-movie-card]');
      var empty = qs('[data-no-results]');
      var params = new URLSearchParams(window.location.search);

      if (input && params.get('q')) {
        input.value = params.get('q');
      }

      function value(el) {
        return el ? String(el.value || '').trim().toLowerCase() : '';
      }

      function apply() {
        var keyword = value(input);
        var y = value(year);
        var r = value(region);
        var t = value(type);
        var visible = 0;

        cards.forEach(function (card) {
          var text = String(card.getAttribute('data-search-text') || '').toLowerCase();
          var cy = String(card.getAttribute('data-year') || '').toLowerCase();
          var cr = String(card.getAttribute('data-region') || '').toLowerCase();
          var ct = String(card.getAttribute('data-type') || '').toLowerCase();
          var matched = (!keyword || text.indexOf(keyword) !== -1) &&
            (!y || cy === y) &&
            (!r || cr.indexOf(r) !== -1) &&
            (!t || ct.indexOf(t) !== -1);

          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [input, year, region, type].forEach(function (el) {
        if (el) {
          el.addEventListener('input', apply);
          el.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  function createPlayer(playerId, source) {
    var box = document.getElementById(playerId);
    if (!box) {
      return;
    }

    var video = box.querySelector('video');
    var cover = box.querySelector('[data-player-button]');
    var hls = null;
    var started = false;

    function play() {
      if (!video) {
        return;
      }

      if (!started) {
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      if (cover) {
        cover.classList.add('is-hidden');
      }

      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.createPlayer = createPlayer;

  ready(function () {
    setupHeader();
    setupCarousel();
    setupFilters();
  });
})();
