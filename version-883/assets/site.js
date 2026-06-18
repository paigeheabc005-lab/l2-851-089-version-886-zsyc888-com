(function () {
    const body = document.body;
    const menuButton = document.querySelector('[data-menu-toggle]');

    if (menuButton) {
        menuButton.addEventListener('click', function () {
            body.classList.toggle('menu-open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('.hero-dot'));
        const previous = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let current = 0;
        let timer = null;

        const showSlide = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        const start = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        };

        if (previous) {
            previous.addEventListener('click', function () {
                showSlide(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                start();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                start();
            });
        });

        showSlide(0);
        start();
    }

    const searchForms = Array.from(document.querySelectorAll('[data-search-form]'));

    searchForms.forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const input = form.querySelector('input');
            const keyword = input ? input.value.trim() : '';
            const target = form.getAttribute('data-search-target') || 'search.html';
            const url = keyword ? target + '?q=' + encodeURIComponent(keyword) : target;
            window.location.href = url;
        });
    });

    const filterRoot = document.querySelector('[data-filter-root]');

    if (filterRoot) {
        const input = filterRoot.querySelector('[data-search-input]');
        const cards = Array.from(filterRoot.querySelectorAll('[data-card]'));
        const buttons = Array.from(filterRoot.querySelectorAll('[data-filter-button]'));
        const empty = filterRoot.querySelector('[data-empty]');
        let active = 'all';

        const normalize = function (value) {
            return String(value || '').toLowerCase().replace(/\s+/g, '');
        };

        const apply = function () {
            const keyword = normalize(input ? input.value : '');
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-year')
                ].join(' '));
                const group = normalize(card.getAttribute('data-group'));
                const matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                const matchedGroup = active === 'all' || group === normalize(active) || haystack.indexOf(normalize(active)) !== -1;
                const isVisible = matchedKeyword && matchedGroup;
                card.style.display = isVisible ? '' : 'none';
                if (isVisible) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        };

        if (input) {
            const params = new URLSearchParams(window.location.search);
            const query = params.get('q');
            if (query) {
                input.value = query;
            }
            input.addEventListener('input', apply);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                active = button.getAttribute('data-filter-button') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                apply();
            });
        });

        apply();
    }
})();

window.initPlayer = function (source) {
    const video = document.querySelector('[data-video-player]');
    const overlay = document.querySelector('[data-play-overlay]');
    let hls = null;
    let attached = false;

    if (!video || !source) {
        return;
    }

    const attach = function () {
        if (attached) {
            return;
        }
        attached = true;
        video.controls = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    };

    const play = function () {
        attach();
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        const promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    };

    if (overlay) {
        overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
        }
    });
};
