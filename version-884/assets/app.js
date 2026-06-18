(function () {
    var menuButton = document.querySelector('.menu-button');
    var mobileNav = document.getElementById('mobileNav');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', String(open));
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var active = 0;
        var show = function (index) {
            active = index;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === active);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                show((active + 1) % slides.length);
            }, 5000);
        }
    }

    var playerBlocks = document.querySelectorAll('[data-player]');
    playerBlocks.forEach(function (block) {
        var video = block.querySelector('video');
        var button = block.querySelector('.player-start');
        if (!video || !button) {
            return;
        }
        var attach = function () {
            if (video.dataset.ready === '1') {
                return;
            }
            var src = video.getAttribute('data-hls');
            if (!src) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(src);
                hls.attachMedia(video);
                video._hlsInstance = hls;
            } else {
                video.src = src;
            }
            video.dataset.ready = '1';
        };
        var play = function () {
            attach();
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        };
        button.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (video.currentTime === 0 || video.ended) {
                button.classList.remove('is-hidden');
            }
        });
    });

    var searchGrid = document.querySelector('[data-search-grid]');
    if (searchGrid) {
        var cards = Array.prototype.slice.call(searchGrid.querySelectorAll('[data-card]'));
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        var form = document.querySelector('[data-search-form]');
        var input = form ? form.querySelector('input[name="q"]') : null;
        var activeFilter = 'all';
        if (input) {
            input.value = query;
        }
        var normalize = function (value) {
            return (value || '').toLowerCase();
        };
        var apply = function () {
            var q = normalize(input ? input.value : query);
            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-category'),
                    card.getAttribute('data-tags'),
                    card.textContent
                ].join(' '));
                var category = card.getAttribute('data-category') || '';
                var matchText = !q || text.indexOf(q) !== -1;
                var matchFilter = activeFilter === 'all' || category === activeFilter;
                card.classList.toggle('hidden', !(matchText && matchFilter));
            });
        };
        if (input) {
            input.addEventListener('input', apply);
        }
        document.querySelectorAll('[data-filter]').forEach(function (button) {
            button.addEventListener('click', function () {
                activeFilter = button.getAttribute('data-filter') || 'all';
                document.querySelectorAll('[data-filter]').forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                apply();
            });
        });
        apply();
    }
})();
