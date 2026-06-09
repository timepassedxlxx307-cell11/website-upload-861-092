(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });

  function initMenu() {
    var header = document.querySelector(".site-header");
    var button = document.querySelector(".menu-toggle");
    if (!header || !button) {
      return;
    }
    button.addEventListener("click", function () {
      var open = header.classList.toggle("nav-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var active = slides.findIndex(function (slide) {
      return slide.classList.contains("is-active");
    });
    if (active < 0) {
      active = 0;
    }

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        var selected = dotIndex === active;
        dot.classList.toggle("is-active", selected);
        if (selected) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-target") || 0));
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
      });
    }
    window.setInterval(function () {
      show(active + 1);
    }, 5200);
  }

  function initFilters() {
    var containers = Array.prototype.slice.call(document.querySelectorAll(".searchable-list"));
    if (!containers.length) {
      return;
    }
    var input = document.querySelector(".page-search");
    var genre = document.querySelector(".genre-filter");
    var category = document.querySelector(".category-filter");
    var controls = [input, genre, category].filter(Boolean);

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var keyword = normalize(input && input.value);
      var genreValue = normalize(genre && genre.value);
      var categoryValue = normalize(category && category.value);
      containers.forEach(function (container) {
        Array.prototype.slice.call(container.children).forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-category"),
            card.textContent
          ].join(" "));
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchGenre = !genreValue || haystack.indexOf(genreValue) !== -1;
          var matchCategory = !categoryValue || normalize(card.getAttribute("data-category")) === categoryValue;
          card.classList.toggle("is-filtered-out", !(matchKeyword && matchGenre && matchCategory));
        });
      });
    }

    controls.forEach(function (control) {
      control.addEventListener("input", apply);
      control.addEventListener("change", apply);
    });
  }

  function initPlayer() {
    var video = document.getElementById("movie-player");
    if (!video) {
      return;
    }
    var overlay = document.querySelector(".video-overlay");
    var url = video.getAttribute("data-play-url");
    var hls = null;

    function ensureVideo() {
      if (!url) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (!video.getAttribute("src")) {
          video.setAttribute("src", url);
        }
      } else if (window.Hls && window.Hls.isSupported()) {
        if (!hls) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(url);
          hls.attachMedia(video);
        }
      } else if (!video.getAttribute("src")) {
        video.setAttribute("src", url);
      }
    }

    function play() {
      ensureVideo();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
  }
})();
