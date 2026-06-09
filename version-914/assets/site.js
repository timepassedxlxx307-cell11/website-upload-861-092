(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-mobile-menu-button]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = selectAll('.hero-slide', slider);
        var dots = selectAll('[data-hero-dot]', slider);
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
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
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });
        show(0);
        restart();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupFilters() {
        var panels = selectAll('.filter-panel');
        if (!panels.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        panels.forEach(function (panel) {
            var root = panel.parentElement || document;
            var cards = selectAll('[data-movie-card]', root);
            var searchInput = panel.querySelector('[data-search-input]');
            var categorySelect = panel.querySelector('[data-filter-category]');
            var regionSelect = panel.querySelector('[data-filter-region]');
            var yearInput = panel.querySelector('[data-filter-year]');
            var count = panel.querySelector('[data-filter-count]');

            if (searchInput && params.get('q')) {
                searchInput.value = params.get('q');
            }

            function applyFilters() {
                var keyword = normalize(searchInput && searchInput.value);
                var category = normalize(categorySelect && categorySelect.value);
                var region = normalize(regionSelect && regionSelect.value);
                var year = normalize(yearInput && yearInput.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-tags'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-year')
                    ].join(' '));
                    var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchesCategory = !category || normalize(card.getAttribute('data-category')) === category;
                    var matchesRegion = !region || normalize(card.getAttribute('data-region')).indexOf(region) !== -1;
                    var matchesYear = !year || normalize(card.getAttribute('data-year')).indexOf(year) !== -1;
                    var isVisible = matchesKeyword && matchesCategory && matchesRegion && matchesYear;
                    card.classList.toggle('is-hidden', !isVisible);
                    if (isVisible) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = '当前显示 ' + visible + ' 部影片';
                }
            }

            [searchInput, categorySelect, regionSelect, yearInput].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', applyFilters);
                    control.addEventListener('change', applyFilters);
                }
            });
            applyFilters();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHeroSlider();
        setupFilters();
    });
}());
