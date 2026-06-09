(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  var toggle = qs('.nav-toggle');
  var mobilePanel = qs('.mobile-panel');
  if (toggle && mobilePanel) {
    toggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slides = qsa('.hero-slide');
  var dots = qsa('.hero-dot');
  var currentSlide = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  function startSlider() {
    if (timer) {
      window.clearInterval(timer);
    }
    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5200);
    }
  }

  qsa('[data-hero-prev]').forEach(function (button) {
    button.addEventListener('click', function () {
      showSlide(currentSlide - 1);
      startSlider();
    });
  });

  qsa('[data-hero-next]').forEach(function (button) {
    button.addEventListener('click', function () {
      showSlide(currentSlide + 1);
      startSlider();
    });
  });

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-slide') || 0));
      startSlider();
    });
  });

  startSlider();

  qsa('[data-player]').forEach(function (box) {
    var video = qs('video', box);
    var playLayer = qs('.play-layer', box);
    var srcNode = video ? qs('source', video) : null;
    var url = srcNode ? srcNode.getAttribute('src') : '';
    var loaded = false;

    function bindVideo() {
      if (!video || !url || loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function playVideo() {
      bindVideo();
      box.classList.add('is-playing');
      var result = video.play();
      if (result && result.catch) {
        result.catch(function () {});
      }
    }

    if (playLayer && video) {
      playLayer.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          box.classList.remove('is-playing');
        }
      });
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
    }
  });

  function renderMovieCard(movie) {
    var tagText = (movie.tags || []).slice(0, 2).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<article class="movie-card">' +
        '<a class="movie-poster" href="' + escapeHtml(movie.url) + '">' +
          '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="movie-type">' + escapeHtml(movie.type) + '</span>' +
        '</a>' +
        '<div class="movie-info">' +
          '<div class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + '</div>' +
          '<h2 class="movie-title"><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>' +
          '<p>' + escapeHtml(movie.oneLine || '') + '</p>' +
          '<div class="movie-tags">' + tagText + '</div>' +
        '</div>' +
      '</article>';
  }

  var searchResults = qs('#search-results');
  var searchInput = qs('[data-search-input]');
  var categorySelect = qs('[data-category-select]');
  var searchTitle = qs('[data-search-title]');
  var searchSubtitle = qs('[data-search-subtitle]');

  function runSearch() {
    if (!searchResults || !window.MOVIE_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var category = (params.get('category') || '').trim();

    if (searchInput) {
      searchInput.value = query;
    }
    if (categorySelect) {
      categorySelect.value = category;
    }

    var normalized = query.toLowerCase();
    var list = window.MOVIE_DATA.filter(function (movie) {
      var text = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.category,
        movie.oneLine,
        (movie.tags || []).join(' ')
      ].join(' ').toLowerCase();
      var queryMatched = !normalized || text.indexOf(normalized) !== -1;
      var categoryMatched = !category || movie.category === category;
      return queryMatched && categoryMatched;
    }).slice(0, 120);

    if (searchTitle) {
      searchTitle.textContent = query || category ? '搜索结果' : '精选影片';
    }
    if (searchSubtitle) {
      searchSubtitle.textContent = query || category ? '已为你筛选相关影片' : '可通过关键词实时筛选影片内容';
    }
    searchResults.innerHTML = list.length ? list.map(renderMovieCard).join('') : '<div class="empty-state"><h2>暂无匹配影片</h2><p>可以尝试更换片名、类型、年份或地区关键词。</p></div>';
  }

  runSearch();
})();
