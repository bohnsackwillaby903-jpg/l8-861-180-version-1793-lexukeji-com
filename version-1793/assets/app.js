(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function bindMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function bindHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  function bindFilters() {
    var list = document.querySelector("[data-filter-list]");
    if (!list) {
      return;
    }
    var input = document.querySelector("[data-movie-filter]");
    var region = document.querySelector("[data-filter-region]");
    var type = document.querySelector("[data-filter-type]");
    var year = document.querySelector("[data-filter-year]");
    var category = document.querySelector("[data-filter-category]");
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card, .rank-item"));
    var queryFromUrl = new URLSearchParams(window.location.search).get("q");
    if (input && queryFromUrl) {
      input.value = queryFromUrl;
    }
    function apply() {
      var q = normalize(input && input.value);
      var wantedRegion = normalize(region && region.value);
      var wantedType = normalize(type && type.value);
      var wantedYear = normalize(year && year.value);
      var wantedCategory = normalize(category && category.value);
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-category"),
          card.getAttribute("data-tags"),
          card.textContent
        ].join(" "));
        var ok = true;
        if (q && haystack.indexOf(q) === -1) ok = false;
        if (wantedRegion && normalize(card.getAttribute("data-region")) !== wantedRegion) ok = false;
        if (wantedType && normalize(card.getAttribute("data-type")) !== wantedType) ok = false;
        if (wantedYear && normalize(card.getAttribute("data-year")) !== wantedYear) ok = false;
        if (wantedCategory && normalize(card.getAttribute("data-category")) !== wantedCategory) ok = false;
        card.classList.toggle("is-hidden", !ok);
      });
    }
    [input, region, type, year, category].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
    apply();
  }

  window.MoviePlayer = {
    init: function (source) {
      var video = document.getElementById("moviePlayer");
      var overlay = document.getElementById("playerOverlay");
      if (!video || !source) {
        return;
      }
      var loaded = false;
      var hls = null;
      function loadAndPlay() {
        if (!loaded) {
          loaded = true;
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true });
            hls.loadSource(source);
            hls.attachMedia(video);
          } else {
            video.src = source;
          }
        }
        var start = video.play();
        if (start && typeof start.catch === "function") {
          start.catch(function () {});
        }
      }
      if (overlay) {
        overlay.addEventListener("click", loadAndPlay);
      }
      video.addEventListener("click", function () {
        if (!loaded) {
          loadAndPlay();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    }
  };

  ready(function () {
    bindMenu();
    bindHero();
    bindFilters();
  });
})();
