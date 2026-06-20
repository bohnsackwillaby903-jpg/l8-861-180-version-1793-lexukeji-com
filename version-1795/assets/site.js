(function () {
  function each(nodes, callback) {
    Array.prototype.forEach.call(nodes, callback);
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function initMobileNav() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = root.querySelectorAll('[data-hero-slide]');
    var dots = root.querySelectorAll('[data-hero-dot]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      each(slides, function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      each(dots, function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }
    each(dots, function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5600);
  }

  function initFilters() {
    var container = document.querySelector('[data-card-container]');
    var input = document.querySelector('[data-page-search]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var sortSelect = document.querySelector('[data-sort-cards]');
    if (!container) {
      return;
    }
    var cards = Array.prototype.slice.call(container.querySelectorAll('.searchable-card'));
    if (yearSelect) {
      var years = [];
      cards.forEach(function (card) {
        var year = card.getAttribute('data-year');
        if (year && years.indexOf(year) === -1) {
          years.push(year);
        }
      });
      years.sort(function (a, b) {
        return parseInt(b, 10) - parseInt(a, 10);
      });
      years.forEach(function (year) {
        var option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
      });
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && input) {
      input.value = query;
    }
    function applyFilter() {
      var term = normalize(input ? input.value : '');
      var year = yearSelect ? yearSelect.value : '';
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.textContent
        ].join(' '));
        var matchedTerm = !term || haystack.indexOf(term) !== -1;
        var matchedYear = !year || card.getAttribute('data-year') === year;
        card.classList.toggle('is-hidden', !(matchedTerm && matchedYear));
      });
    }
    function applySort() {
      if (!sortSelect) {
        return;
      }
      var value = sortSelect.value;
      var sorted = cards.slice();
      if (value === 'year-desc') {
        sorted.sort(function (a, b) {
          return parseInt(b.getAttribute('data-year') || '0', 10) - parseInt(a.getAttribute('data-year') || '0', 10);
        });
      }
      if (value === 'title-asc') {
        sorted.sort(function (a, b) {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-CN');
        });
      }
      sorted.forEach(function (card) {
        container.appendChild(card);
      });
    }
    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        applySort();
        applyFilter();
      });
    }
    applyFilter();
  }

  window.initMoviePlayer = function (playerId, sourceUrl) {
    var video = document.getElementById(playerId);
    if (!video || !sourceUrl) {
      return;
    }
    var shell = video.closest('[data-player-shell]');
    var ready = false;
    function attach() {
      if (ready) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        ready = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        ready = true;
        return;
      }
      video.src = sourceUrl;
      ready = true;
    }
    function play() {
      attach();
      if (shell) {
        shell.classList.add('is-playing');
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }
    var button = document.querySelector('[data-play-button="' + playerId + '"]');
    if (button) {
      button.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (!ready) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (shell) {
        shell.classList.add('is-playing');
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initHero();
    initFilters();
  });
})();
