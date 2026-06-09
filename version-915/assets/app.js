(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var open = panel.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
            button.textContent = open ? "×" : "☰";
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var prev = slider.querySelector(".hero-prev");
        var next = slider.querySelector(".hero-next");
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var grids = Array.prototype.slice.call(document.querySelectorAll(".filter-grid"));
        if (!grids.length) {
            return;
        }
        var search = document.querySelector("[data-filter-search]");
        var year = document.querySelector("[data-filter-year]");
        var region = document.querySelector("[data-filter-region]");
        var empty = document.querySelector("[data-empty-state]");
        var cards = [];
        grids.forEach(function (grid) {
            cards = cards.concat(Array.prototype.slice.call(grid.querySelectorAll(".movie-card")));
        });
        function populate(select, attr) {
            if (!select || select.options.length > 1) {
                return;
            }
            var values = cards.map(function (card) {
                return card.getAttribute(attr) || "";
            }).filter(Boolean).filter(function (value, index, arr) {
                return arr.indexOf(value) === index;
            }).sort().reverse();
            values.forEach(function (value) {
                var option = document.createElement("option");
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }
        populate(year, "data-year");
        populate(region, "data-region");
        function apply() {
            var keyword = search ? search.value.trim().toLowerCase() : "";
            var selectedYear = year ? year.value : "";
            var selectedRegion = region ? region.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-category")
                ].join(" ").toLowerCase();
                var ok = true;
                if (keyword && haystack.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (selectedYear && card.getAttribute("data-year") !== selectedYear) {
                    ok = false;
                }
                if (selectedRegion && card.getAttribute("data-region") !== selectedRegion) {
                    ok = false;
                }
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }
        [search, year, region].forEach(function (node) {
            if (node) {
                node.addEventListener("input", apply);
                node.addEventListener("change", apply);
            }
        });
        apply();
    }

    function cardHtml(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return [
            "<article class=\"movie-card\">",
            "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" decoding=\"async\">",
            "<span class=\"poster-play\">▶</span>",
            "</a>",
            "<div class=\"movie-card-body\">",
            "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
            "<p>" + escapeHtml(movie.one_line || "") + "</p>",
            "<div class=\"tag-row\">" + tags + "</div>",
            "<div class=\"card-meta\"><span>" + escapeHtml(movie.region || "") + "</span><span>" + escapeHtml(movie.year || "") + "</span><span>" + escapeHtml(movie.category || "") + "</span></div>",
            "</div>",
            "</article>"
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>\"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[char];
        });
    }

    function setupSearchPage() {
        var results = document.querySelector("[data-search-results]");
        var input = document.querySelector("[data-search-page-input]");
        var title = document.querySelector("[data-search-title]");
        var summary = document.querySelector("[data-search-summary]");
        if (!results || !input || !window.SITE_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        input.value = q;
        function render(keyword) {
            var key = keyword.trim().toLowerCase();
            if (!key) {
                return;
            }
            var matched = window.SITE_MOVIES.filter(function (movie) {
                return [movie.title, movie.region, movie.year, movie.category, movie.genre, (movie.tags || []).join(" "), movie.one_line].join(" ").toLowerCase().indexOf(key) !== -1;
            }).slice(0, 120);
            title.textContent = "搜索：“" + keyword + "”";
            summary.textContent = matched.length ? "以下内容与关键词相关。" : "没有找到匹配内容。";
            results.innerHTML = matched.map(cardHtml).join("");
        }
        render(q);
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
})();
