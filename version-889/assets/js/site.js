(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initFilter();
        initPlayers();
        initHeaderSearch();
    });

    function initMobileMenu() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHeaderSearch() {
        var forms = document.querySelectorAll('[data-site-search]');
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input');
                var value = input ? input.value.trim() : '';
                var target = './categories.html';
                if (value) {
                    target += '?q=' + encodeURIComponent(value);
                }
                window.location.href = target;
            });
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(index);
                play();
            });
        });

        show(0);
        play();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function initFilter() {
        var panels = document.querySelectorAll('[data-filter-panel]');
        panels.forEach(function (panel) {
            var input = panel.querySelector('[data-filter-input]');
            var category = panel.querySelector('[data-filter-category]');
            var year = panel.querySelector('[data-filter-year]');
            var grid = document.querySelector(panel.getAttribute('data-filter-target'));
            var empty = document.querySelector(panel.getAttribute('data-empty-target'));
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll('.js-movie-card'));
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');
            if (query && input) {
                input.value = query;
            }

            function apply() {
                var needle = normalize(input ? input.value : '');
                var selectedCategory = category ? category.value : '';
                var selectedYear = year ? year.value : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-title') + card.getAttribute('data-keywords'));
                    var sameCategory = !selectedCategory || card.getAttribute('data-category') === selectedCategory;
                    var sameYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
                    var sameText = !needle || text.indexOf(needle) !== -1;
                    var keep = sameCategory && sameYear && sameText;
                    card.style.display = keep ? '' : 'none';
                    if (keep) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.style.display = visible ? 'none' : 'block';
                }
            }

            [input, category, year].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    function initPlayers() {
        var shells = document.querySelectorAll('[data-player]');
        shells.forEach(function (shell) {
            var video = shell.querySelector('video');
            var overlay = shell.querySelector('.play-overlay');
            if (!video) {
                return;
            }
            function begin() {
                startVideo(video, overlay);
            }
            if (overlay) {
                overlay.addEventListener('click', begin);
            }
            shell.addEventListener('click', function (event) {
                if (event.target === video && video.paused && !video.getAttribute('src')) {
                    begin();
                }
            });
        });
    }

    function startVideo(video, overlay) {
        var streamUrl = video.getAttribute('data-stream');
        if (!streamUrl) {
            return;
        }
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        video.controls = true;
        video.playsInline = true;

        function playNow() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (video.dataset.ready === '1') {
            playNow();
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            video.dataset.ready = '1';
            video.addEventListener('loadedmetadata', playNow, { once: true });
            playNow();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.dataset.ready = '1';
                playNow();
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    try {
                        hls.destroy();
                    } catch (error) {}
                    video.src = streamUrl;
                    video.dataset.ready = '1';
                    playNow();
                }
            });
            video._hls = hls;
            return;
        }

        video.src = streamUrl;
        video.dataset.ready = '1';
        playNow();
    }
})();
