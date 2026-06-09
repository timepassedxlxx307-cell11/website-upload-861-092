document.addEventListener('DOMContentLoaded', function() {
  setupMobileNavigation();
  setupHeaderSearchForms();
  setupHeroCarousel();
  setupPageFilters();
  setupSearchPage();
});

function setupMobileNavigation() {
  var button = document.querySelector('.mobile-menu-button');
  var menu = document.querySelector('.mobile-nav');

  if (!button || !menu) {
    return;
  }

  button.addEventListener('click', function() {
    var expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    menu.hidden = expanded;
  });
}

function setupHeaderSearchForms() {
  var forms = document.querySelectorAll('.site-search-form, .large-search');

  forms.forEach(function(form) {
    form.addEventListener('submit', function(event) {
      var input = form.querySelector('input[name="q"]');

      if (!input || !input.value.trim()) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
    });
  });
}

function setupHeroCarousel() {
  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));

  if (slides.length <= 1) {
    return;
  }

  var current = 0;
  var timer = null;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function start() {
    timer = window.setInterval(function() {
      showSlide(current + 1);
    }, 5600);
  }

  dots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      window.clearInterval(timer);
      showSlide(Number(dot.getAttribute('data-slide')) || 0);
      start();
    });
  });

  start();
}

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, '');
}

function filterCards(input) {
  var keyword = normalizeText(input.value);
  var scope = input.closest('main') || document;
  var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

  cards.forEach(function(card) {
    var text = normalizeText(card.getAttribute('data-filter-text'));
    card.hidden = keyword && text.indexOf(keyword) === -1;
  });
}

function setupPageFilters() {
  var inputs = Array.prototype.slice.call(document.querySelectorAll('.page-filter-input'));

  inputs.forEach(function(input) {
    input.addEventListener('input', function() {
      filterCards(input);
    });
  });
}

function setupSearchPage() {
  if (document.body.getAttribute('data-page') !== 'search') {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  var input = document.getElementById('site-search-input');

  if (input && query) {
    input.value = query;
    filterCards(input);
  }
}
