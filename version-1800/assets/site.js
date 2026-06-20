(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === heroIndex);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === heroIndex);
    });
  }

  dots.forEach(function (dot, current) {
    dot.addEventListener('click', function () {
      showHero(current);
    });
  });

  if (slides.length > 1) {
    showHero(0);
    setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function textOf(card) {
    return normalize([
      card.dataset.title,
      card.dataset.year,
      card.dataset.region,
      card.dataset.type,
      card.dataset.genre,
      card.textContent
    ].join(' '));
  }

  const localSearch = document.querySelector('[data-local-search]');
  const yearFilter = document.querySelector('[data-filter-year]');
  const typeFilter = document.querySelector('[data-filter-type]');
  const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
  const emptyState = document.querySelector('[data-empty-state]');

  function applyLocalFilter() {
    if (!cards.length) {
      return;
    }
    const query = normalize(localSearch ? localSearch.value : '');
    const yearValue = yearFilter ? yearFilter.value : '';
    const typeValue = typeFilter ? typeFilter.value : '';
    let visibleCount = 0;

    cards.forEach(function (card) {
      const matchesQuery = !query || textOf(card).includes(query);
      const movieYear = Number(card.dataset.year || 0);
      let matchesYear = true;

      if (yearValue === 'new') {
        matchesYear = movieYear >= 2024;
      }
      if (yearValue === 'classic') {
        matchesYear = movieYear > 0 && movieYear < 2020;
      }
      if (yearValue === 'middle') {
        matchesYear = movieYear >= 2020 && movieYear < 2024;
      }

      const matchesType = !typeValue || normalize(card.dataset.type).includes(normalize(typeValue));
      const visible = matchesQuery && matchesYear && matchesType;
      card.style.display = visible ? '' : 'none';
      if (visible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visibleCount === 0);
    }
  }

  [localSearch, yearFilter, typeFilter].forEach(function (item) {
    if (item) {
      item.addEventListener('input', applyLocalFilter);
      item.addEventListener('change', applyLocalFilter);
    }
  });

  const headerInput = document.querySelector('[data-header-search]');
  const suggestBox = document.querySelector('[data-search-suggest]');

  function resultItem(movie) {
    return '<a class="suggest-item" href="./' + movie.url + '">' +
      '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '">' +
      '<span><strong>' + movie.title + '</strong><span>' + movie.year + ' · ' + movie.region + ' · ' + movie.genre + '</span></span>' +
      '</a>';
  }

  if (headerInput && suggestBox && Array.isArray(window.SearchMovies)) {
    headerInput.addEventListener('input', function () {
      const query = normalize(headerInput.value);
      if (!query) {
        suggestBox.classList.remove('is-open');
        suggestBox.innerHTML = '';
        return;
      }
      const results = window.SearchMovies.filter(function (movie) {
        return normalize(movie.title + ' ' + movie.year + ' ' + movie.region + ' ' + movie.genre + ' ' + movie.type).includes(query);
      }).slice(0, 8);
      suggestBox.innerHTML = results.map(resultItem).join('');
      suggestBox.classList.toggle('is-open', results.length > 0);
    });

    document.addEventListener('click', function (event) {
      if (!event.target.closest('.header-search')) {
        suggestBox.classList.remove('is-open');
      }
    });
  }

  const globalInput = document.querySelector('[data-global-search]');
  const globalResults = document.querySelector('[data-global-results]');

  function globalCard(movie) {
    return '<article class="movie-card" data-movie-card>' +
      '<a class="movie-cover" href="./' + movie.url + '">' +
      '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">' +
      '<span class="cover-badge">' + movie.year + '</span>' +
      '</a>' +
      '<div class="movie-info">' +
      '<a class="movie-title" href="./' + movie.url + '">' + movie.title + '</a>' +
      '<p class="movie-meta">' + movie.region + ' · ' + movie.type + ' · ' + movie.genre + '</p>' +
      '<p class="movie-desc">' + movie.oneLine + '</p>' +
      '<p class="movie-tags">' + movie.category + '</p>' +
      '</div>' +
      '</article>';
  }

  function renderGlobalSearch() {
    if (!globalInput || !globalResults || !Array.isArray(window.SearchMovies)) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const paramQuery = params.get('q') || '';
    if (paramQuery && !globalInput.value) {
      globalInput.value = paramQuery;
    }
    const query = normalize(globalInput.value);
    const source = query ? window.SearchMovies.filter(function (movie) {
      return normalize(movie.title + ' ' + movie.year + ' ' + movie.region + ' ' + movie.genre + ' ' + movie.type + ' ' + movie.oneLine).includes(query);
    }) : window.SearchMovies.slice(0, 80);
    globalResults.innerHTML = source.slice(0, 120).map(globalCard).join('');
  }

  if (globalInput && globalResults) {
    globalInput.addEventListener('input', renderGlobalSearch);
    renderGlobalSearch();
  }
})();
