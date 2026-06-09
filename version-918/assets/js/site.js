(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

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
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var filterArea = document.querySelector("[data-filter-area]");
    if (!filterArea) {
      return;
    }
    var input = filterArea.querySelector(".filter-input");
    var category = filterArea.querySelector('[data-filter="category"]');
    var year = filterArea.querySelector('[data-filter="year"]');
    var clear = filterArea.querySelector(".filter-clear");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var noResults = document.querySelector(".no-results");
    var params = new URLSearchParams(window.location.search);

    if (input && params.get("q")) {
      input.value = params.get("q");
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var keyword = normalize(input ? input.value : "");
      var selectedCategory = category ? category.value : "";
      var selectedYear = year ? year.value : "";
      var visibleCount = 0;
      cards.forEach(function (card) {
        var content = normalize(card.getAttribute("data-search") + " " + card.textContent);
        var matchKeyword = !keyword || content.indexOf(keyword) !== -1;
        var matchCategory = !selectedCategory || card.getAttribute("data-category") === selectedCategory;
        var matchYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
        var visible = matchKeyword && matchCategory && matchYear;
        card.style.display = visible ? "" : "none";
        if (visible) {
          visibleCount += 1;
        }
      });
      if (noResults) {
        noResults.style.display = visibleCount ? "none" : "block";
      }
    }

    [input, category, year].forEach(function (element) {
      if (element) {
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      }
    });
    if (clear) {
      clear.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        if (category) {
          category.value = "";
        }
        if (year) {
          year.value = "";
        }
        apply();
      });
    }
    apply();
  }

  window.initMoviePlayer = function (videoId, buttonId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !source) {
      return;
    }
    var hlsInstance = null;

    function attachSource() {
      if (video.getAttribute("data-ready") === "true") {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
      video.setAttribute("data-ready", "true");
    }

    function startPlay() {
      attachSource();
      button.classList.add("is-hidden");
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", startPlay);
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlay();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    initMenu();
    initSlider();
    initFilters();
  });
})();
