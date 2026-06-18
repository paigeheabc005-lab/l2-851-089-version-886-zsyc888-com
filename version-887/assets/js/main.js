(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero-carousel]");

        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function showSlide(index) {
                if (!slides.length) {
                    return;
                }

                current = (index + slides.length) % slides.length;

                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });

                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            function startTimer() {
                stopTimer();
                timer = window.setInterval(function () {
                    showSlide(current + 1);
                }, 5200);
            }

            function stopTimer() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    showSlide(current - 1);
                    startTimer();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    showSlide(current + 1);
                    startTimer();
                });
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    showSlide(index);
                    startTimer();
                });
            });

            hero.addEventListener("mouseenter", stopTimer);
            hero.addEventListener("mouseleave", startTimer);
            showSlide(0);
            startTimer();
        }

        var heroSearch = document.querySelector("[data-hero-search]");

        if (heroSearch) {
            heroSearch.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = heroSearch.querySelector("input");
                var query = input ? input.value.trim() : "";
                var target = heroSearch.getAttribute("action") || "search.html";

                if (query) {
                    window.location.href = target + "?q=" + encodeURIComponent(query);
                } else {
                    window.location.href = target;
                }
            });
        }

        var filterForm = document.querySelector("[data-filter-form]");

        if (filterForm) {
            var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
            var searchInput = filterForm.querySelector("[data-filter-search]");
            var regionSelect = filterForm.querySelector("[data-filter-region]");
            var yearSelect = filterForm.querySelector("[data-filter-year]");
            var typeSelect = filterForm.querySelector("[data-filter-type]");
            var params = new URLSearchParams(window.location.search);
            var queryValue = params.get("q");

            if (queryValue && searchInput) {
                searchInput.value = queryValue;
            }

            function normalize(value) {
                return String(value || "").toLowerCase().replace(/\s+/g, "");
            }

            function applyFilters() {
                var query = normalize(searchInput ? searchInput.value : "");
                var region = regionSelect ? regionSelect.value : "";
                var year = yearSelect ? yearSelect.value : "";
                var type = typeSelect ? typeSelect.value : "";

                cards.forEach(function (card) {
                    var haystack = normalize(card.textContent);
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesRegion = !region || card.getAttribute("data-region") === region;
                    var matchesYear = !year || card.getAttribute("data-year") === year;
                    var matchesType = !type || card.getAttribute("data-type") === type;
                    var visible = matchesQuery && matchesRegion && matchesYear && matchesType;
                    card.classList.toggle("is-hidden-card", !visible);
                });
            }

            [searchInput, regionSelect, yearSelect, typeSelect].forEach(function (field) {
                if (field) {
                    field.addEventListener("input", applyFilters);
                    field.addEventListener("change", applyFilters);
                }
            });

            filterForm.addEventListener("reset", function () {
                window.setTimeout(applyFilters, 0);
            });

            applyFilters();
        }
    });
})();
