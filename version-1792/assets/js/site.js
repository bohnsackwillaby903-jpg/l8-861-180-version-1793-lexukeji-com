(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var navMenu = document.querySelector('[data-nav-menu]');

  if (navButton && navMenu) {
    navButton.addEventListener('click', function () {
      var open = navMenu.classList.toggle('is-open');
      navButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showHero(index) {
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
    }

    function startHero() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showHero(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showHero(dotIndex);
        startHero();
      });
    });

    startHero();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function matchText(text, query) {
    return normalize(text).indexOf(normalize(query)) !== -1;
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var page = scope.closest('.page-main') || document;
    var input = page.querySelector('[data-filter-input]');
    var year = page.querySelector('[data-year-filter]');
    var type = page.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));

    function applyFilter() {
      var q = input ? input.value : '';
      var y = year ? year.value : '';
      var t = type ? type.value : '';

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type')
        ].join(' ');
        var ok = (!q || matchText(haystack, q)) && (!y || card.getAttribute('data-year') === y) && (!t || card.getAttribute('data-type') === t);
        card.classList.toggle('is-hidden', !ok);
      });
    }

    [input, year, type].forEach(function (node) {
      if (node) {
        node.addEventListener('input', applyFilter);
        node.addEventListener('change', applyFilter);
      }
    });
  });

  function buildSearchItem(movie) {
    return '<a class="search-item" href="./' + movie.href + '">' +
      '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '">' +
      '<span><strong>' + movie.title + '</strong><span>' + movie.year + ' · ' + movie.region + ' · ' + movie.type + '</span></span>' +
      '</a>';
  }

  function searchMovies(query, limit) {
    var q = normalize(query);
    if (!q || !window.SITE_MOVIES) {
      return [];
    }
    return window.SITE_MOVIES.filter(function (movie) {
      return normalize(movie.title + ' ' + movie.year + ' ' + movie.region + ' ' + movie.type + ' ' + movie.tags).indexOf(q) !== -1;
    }).slice(0, limit);
  }

  document.querySelectorAll('[data-global-search]').forEach(function (form) {
    var input = form.querySelector('input[type="search"]');
    var panel = form.querySelector('[data-search-panel]');

    if (!input || !panel) {
      return;
    }

    input.addEventListener('input', function () {
      var results = searchMovies(input.value, 8);
      panel.innerHTML = results.map(buildSearchItem).join('');
      panel.classList.toggle('is-open', results.length > 0);
    });

    form.addEventListener('submit', function (event) {
      if (!input.value.trim()) {
        event.preventDefault();
      }
    });

    document.addEventListener('click', function (event) {
      if (!form.contains(event.target)) {
        panel.classList.remove('is-open');
      }
    });
  });

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage) {
    var searchInput = document.querySelector('[data-search-page-input]');
    var searchResults = document.querySelector('[data-search-page-results]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    function renderSearchPage() {
      var results = searchMovies(searchInput.value, 80);
      searchResults.innerHTML = results.map(function (movie) {
        return '<a class="search-result-card" href="./' + movie.href + '">' +
          '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '">' +
          '<span><h2>' + movie.title + '</h2><p>' + movie.year + ' · ' + movie.region + ' · ' + movie.type + ' · ' + movie.tags + '</p></span>' +
          '</a>';
      }).join('');
    }

    if (searchInput) {
      searchInput.value = initialQuery;
      searchInput.addEventListener('input', renderSearchPage);
      renderSearchPage();
    }
  }
})();
