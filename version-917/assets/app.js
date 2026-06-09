(function () {
    var hlsLoader = null;

    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (hlsLoader) {
            return hlsLoader;
        }

        hlsLoader = new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js";
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = function () {
                reject(new Error("player"));
            };
            document.head.appendChild(script);
        });

        return hlsLoader;
    }

    function initNavigation() {
        var toggle = qs("[data-menu-toggle]");
        var panel = qs("[data-mobile-panel]");

        if (!toggle || !panel) {
            return;
        }

        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initImages() {
        qsa("img").forEach(function (image) {
            image.addEventListener("error", function () {
                var holder = image.closest(".poster-shell, .hero-media, .rank-thumb");
                if (holder) {
                    holder.classList.add("image-muted");
                }
                image.style.display = "none";
            });
        });
    }

    function initSearchJumps() {
        qsa("[data-search-jump]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = qs("input", form);
                var query = input ? input.value.trim() : "";
                var target = "search.html";
                if (query) {
                    target += "?q=" + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function initHero() {
        var slider = qs("[data-hero-slider]");

        if (!slider) {
            return;
        }

        var slides = qsa(".hero-slide", slider);
        var dots = qsa(".hero-dot", slider);
        var previous = qs("[data-hero-prev]", slider);
        var next = qs("[data-hero-next]", slider);
        var index = 0;
        var timer = null;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === index);
            });
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, position) {
            dot.addEventListener("click", function () {
                show(position);
                play();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                show(index - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                play();
            });
        }

        show(0);
        play();
    }

    function initCardFilters() {
        qsa("[data-filter-cards]").forEach(function (input) {
            var target = input.getAttribute("data-filter-cards");
            var cards = qsa(target);

            input.addEventListener("input", function () {
                var value = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type")
                    ].join(" ").toLowerCase();
                    card.style.display = haystack.indexOf(value) >= 0 ? "" : "none";
                });
            });
        });
    }

    function movieCard(movie) {
        return [
            "<article class=\"movie-card\" data-title=\"" + escapeHtml(movie.title) + "\" data-genre=\"" + escapeHtml(movie.genre) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-region=\"" + escapeHtml(movie.region) + "\" data-type=\"" + escapeHtml(movie.type) + "\">",
            "    <a class=\"poster-shell\" href=\"" + escapeHtml(movie.url) + "\">",
            "        <img src=\"./" + escapeHtml(movie.image) + ".jpg\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
            "        <span class=\"card-badge\">" + escapeHtml(movie.type) + "</span>",
            "        <span class=\"card-year\">" + escapeHtml(movie.year) + "</span>",
            "    </a>",
            "    <div class=\"movie-card-body\">",
            "        <h3 class=\"movie-title\"><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
            "        <div class=\"movie-card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>·</span><span>" + escapeHtml(movie.genre) + "</span></div>",
            "        <p class=\"movie-card-copy\">" + escapeHtml(movie.oneLine) + "</p>",
            "    </div>",
            "</article>"
        ].join("\n");
    }

    function initSearchPage() {
        var input = qs("#searchPageInput");
        var type = qs("#searchType");
        var year = qs("#searchYear");
        var genre = qs("#searchGenre");
        var results = qs("#searchResults");
        var movies = window.MOVIE_DATA || [];

        if (!input || !results || !movies.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        input.value = params.get("q") || "";

        function matchText(movie, value) {
            if (!value) {
                return true;
            }

            var haystack = [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.tags,
                movie.oneLine,
                movie.category
            ].join(" ").toLowerCase();

            return haystack.indexOf(value) >= 0;
        }

        function render() {
            var value = input.value.trim().toLowerCase();
            var typeValue = type ? type.value : "";
            var yearValue = year ? year.value : "";
            var genreValue = genre ? genre.value : "";
            var list = movies.filter(function (movie) {
                var okText = matchText(movie, value);
                var okType = !typeValue || movie.type.indexOf(typeValue) >= 0;
                var okYear = !yearValue || String(movie.year).indexOf(yearValue) >= 0;
                var okGenre = !genreValue || movie.genre.indexOf(genreValue) >= 0 || movie.tags.indexOf(genreValue) >= 0;
                return okText && okType && okYear && okGenre;
            });

            if (!list.length) {
                results.innerHTML = "<div class=\"empty-state\">没有找到匹配的影片，换个关键词试试。</div>";
                return;
            }

            results.innerHTML = list.map(movieCard).join("\n");
            initImages();
        }

        [input, type, year, genre].forEach(function (control) {
            if (control) {
                control.addEventListener("input", render);
                control.addEventListener("change", render);
            }
        });

        render();
    }

    function initPlayers() {
        qsa("[data-player]").forEach(function (box) {
            var video = qs("video", box);
            var cover = qs(".player-cover", box);
            var status = qs(".player-status", box);
            var source = box.getAttribute("data-play");
            var started = false;

            if (!video || !source) {
                return;
            }

            function setStatus(text) {
                if (status) {
                    status.textContent = text || "";
                }
            }

            function attachNative() {
                video.src = source;
                return Promise.resolve();
            }

            function attachHls() {
                return loadHls().then(function (Hls) {
                    if (Hls && Hls.isSupported()) {
                        if (video.__hls) {
                            video.__hls.destroy();
                        }
                        video.__hls = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true,
                            backBufferLength: 90
                        });
                        video.__hls.loadSource(source);
                        video.__hls.attachMedia(video);
                        return;
                    }
                    video.src = source;
                });
            }

            function start() {
                if (started) {
                    video.play().catch(function () {});
                    return;
                }

                started = true;
                setStatus("正在打开影片...");
                if (cover) {
                    cover.classList.add("is-hidden");
                }

                var job = video.canPlayType("application/vnd.apple.mpegurl") ? attachNative() : attachHls();
                job.then(function () {
                    return video.play();
                }).then(function () {
                    setStatus("");
                }).catch(function () {
                    setStatus("暂时无法播放，请稍后再试");
                    started = false;
                    if (cover) {
                        cover.classList.remove("is-hidden");
                    }
                });
            }

            box.addEventListener("click", function (event) {
                if (event.target.closest("video") && started) {
                    return;
                }
                start();
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initNavigation();
        initImages();
        initSearchJumps();
        initHero();
        initCardFilters();
        initSearchPage();
        initPlayers();
    });
})();
