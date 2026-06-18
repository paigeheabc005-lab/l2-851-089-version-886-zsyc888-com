
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    setupHeader();
    setupSearch();
    setupHero();
    setupFilters();
    setupTabs();
    setupPlayer();
    setupBackTop();
  });

  function setupHeader() {
    var header = document.querySelector('[data-header]');
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    function updateHeader() {
      if (!header) {
        return;
      }
      header.classList.toggle('is-scrolled', window.scrollY > 18);
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (toggle && panel && header) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
        header.classList.toggle('is-open', panel.classList.contains('is-open'));
      });
    }
  }

  function setupSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-global-search]'));
    var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-search-results]'));
    var data = window.MOVIE_INDEX || [];

    if (!inputs.length || !boxes.length || !data.length) {
      return;
    }

    inputs.forEach(function (input) {
      input.addEventListener('input', function () {
        var keyword = input.value.trim().toLowerCase();
        render(keyword);
      });
      input.addEventListener('focus', function () {
        var keyword = input.value.trim().toLowerCase();
        render(keyword);
      });
      input.addEventListener('keydown', function (event) {
        var keyword = input.value.trim().toLowerCase();
        if (event.key === 'Enter') {
          var first = findMatches(keyword)[0];
          if (first) {
            window.location.href = first.link;
          }
        }
      });
    });

    document.addEventListener('click', function (event) {
      if (!event.target.closest('.header-search') && !event.target.closest('.mobile-search')) {
        boxes.forEach(function (box) {
          box.classList.remove('is-visible');
        });
      }
    });

    function findMatches(keyword) {
      if (!keyword) {
        return [];
      }
      return data.filter(function (item) {
        var text = [item.title, item.category, item.region, item.type, item.year, item.genre, (item.tags || []).join(' ')].join(' ').toLowerCase();
        return text.indexOf(keyword) !== -1;
      }).slice(0, 8);
    }

    function render(keyword) {
      var matches = findMatches(keyword);
      boxes.forEach(function (box) {
        if (!keyword) {
          box.classList.remove('is-visible');
          box.innerHTML = '';
          return;
        }
        box.classList.add('is-visible');
        if (!matches.length) {
          box.innerHTML = '<div class="search-empty">未找到相关视频</div>';
          return;
        }
        box.innerHTML = matches.map(function (item) {
          return '<a class="search-result-item" href="' + item.link + '">' +
            '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
            '<span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.category) + ' · ' + escapeHtml(item.year) + '</span></span>' +
            '</a>';
        }).join('');
      });
    }
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    if (!slides.length) {
      return;
    }

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    start();
  }

  function setupFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('.page-filter-form'));

    forms.forEach(function (form) {
      var keyword = form.querySelector('[data-page-keyword]');
      var year = form.querySelector('[data-page-year]');
      var type = form.querySelector('[data-page-type]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-grid .movie-card'));

      function apply() {
        var key = keyword ? keyword.value.trim().toLowerCase() : '';
        var selectedYear = year ? year.value : '';
        var selectedType = type ? type.value : '';

        cards.forEach(function (card) {
          var text = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.genre].join(' ').toLowerCase();
          var matchKey = !key || text.indexOf(key) !== -1;
          var matchYear = !selectedYear || card.dataset.year === selectedYear;
          var matchType = !selectedType || card.dataset.type === selectedType;
          card.classList.toggle('is-filtered-out', !(matchKey && matchYear && matchType));
        });
      }

      [keyword, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function setupTabs() {
    var containers = Array.prototype.slice.call(document.querySelectorAll('[data-tabs]'));

    containers.forEach(function (container) {
      var buttons = Array.prototype.slice.call(container.querySelectorAll('[data-tab-button]'));
      var panels = Array.prototype.slice.call(container.querySelectorAll('[data-tab-panel]'));

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          var key = button.getAttribute('data-tab-button');
          buttons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          panels.forEach(function (panel) {
            panel.classList.toggle('is-active', panel.getAttribute('data-tab-panel') === key);
          });
        });
      });
    });
  }

  function setupPlayer() {
    var configEl = document.getElementById('playerConfig');
    var video = document.getElementById('videoPlayer');
    var button = document.querySelector('[data-play-button]');

    if (!configEl || !video || !button) {
      return;
    }

    var config = {};
    var attached = false;
    var hls = null;

    try {
      config = JSON.parse(configEl.textContent || '{}');
    } catch (error) {
      config = {};
    }

    function attach() {
      if (attached || !config.src) {
        return;
      }
      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = config.src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(config.src);
        hls.attachMedia(video);
      } else {
        video.src = config.src;
      }
    }

    function play() {
      attach();
      button.classList.add('is-hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    button.addEventListener('click', play);
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        button.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  function setupBackTop() {
    var button = document.querySelector('[data-back-top]');

    if (!button) {
      return;
    }

    function update() {
      button.classList.toggle('is-visible', window.scrollY > 600);
    }

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[char];
    });
  }
})();
