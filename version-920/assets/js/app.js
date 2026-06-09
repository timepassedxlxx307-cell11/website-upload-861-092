(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var opened = nav.classList.toggle('is-open');
      button.setAttribute('aria-expanded', opened ? 'true' : 'false');
      button.textContent = opened ? '×' : '☰';
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var next = hero.querySelector('[data-hero-next]');
    var prev = hero.querySelector('[data-hero-prev]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
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
      }, 5000);
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });
    restart();
  }

  function setupFilters() {
    var panel = document.querySelector('[data-search-panel]');
    var localSearch = document.querySelector('[data-local-search]');
    var list = document.querySelector('[data-card-list]');
    var empty = document.querySelector('[data-empty-state]');
    if (!list) {
      return;
    }
    var cards = selectAll('.searchable-card', list);

    function value(selector) {
      var node = document.querySelector(selector);
      return node ? node.value.trim().toLowerCase() : '';
    }

    function filterCards() {
      var keyword = panel ? value('[data-global-search]') : (localSearch ? localSearch.value.trim().toLowerCase() : '');
      var category = panel ? value('[data-filter-category]') : '';
      var type = panel ? value('[data-filter-type]') : '';
      var year = panel ? value('[data-filter-year]') : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-category') || '',
          card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();
        var ok = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          ok = false;
        }
        if (category && (card.getAttribute('data-category') || '').toLowerCase() !== category) {
          ok = false;
        }
        if (type && (card.getAttribute('data-type') || '').toLowerCase() !== type) {
          ok = false;
        }
        if (year && (card.getAttribute('data-year') || '').toLowerCase() !== year) {
          ok = false;
        }
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (panel) {
      selectAll('input, select', panel).forEach(function (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      });
    }
    if (localSearch) {
      localSearch.addEventListener('input', filterCards);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
