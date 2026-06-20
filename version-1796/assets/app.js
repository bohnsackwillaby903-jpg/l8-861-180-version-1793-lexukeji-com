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

  ready(function () {
    var header = document.querySelector(".site-header");
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector(".mobile-nav");

    function syncHeader() {
      if (!header) {
        return;
      }
      if (window.scrollY > 18) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-hidden");
      }, { once: true });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var currentSlide = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === currentSlide);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === currentSlide);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5600);
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var filterSelect = document.querySelector("[data-filter-select]");
    var filterCards = Array.prototype.slice.call(document.querySelectorAll(".filter-card"));

    function applyFilter() {
      var keyword = normalize(filterInput ? filterInput.value : "");
      var type = normalize(filterSelect ? filterSelect.value : "");

      filterCards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.textContent
        ].join(" "));
        var cardType = normalize(card.getAttribute("data-type"));
        var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
        var typeMatched = !type || cardType.indexOf(type) !== -1 || haystack.indexOf(type) !== -1;
        card.classList.toggle("hidden-card", !(keywordMatched && typeMatched));
      });
    }

    if (filterInput || filterSelect) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && filterInput) {
        filterInput.value = q;
      }
      if (filterInput) {
        filterInput.addEventListener("input", applyFilter);
      }
      if (filterSelect) {
        filterSelect.addEventListener("change", applyFilter);
      }
      applyFilter();
    }
  });

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = document.querySelector("script[data-hls-loader]");
    if (existing) {
      existing.addEventListener("load", callback, { once: true });
      return;
    }
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
    script.async = true;
    script.setAttribute("data-hls-loader", "1");
    script.addEventListener("load", callback, { once: true });
    document.head.appendChild(script);
  }

  function initMoviePlayer(streamUrl) {
    var video = document.getElementById("movieVideo");
    var layer = document.getElementById("playLayer");
    var started = false;
    var hlsInstance = null;

    if (!video || !streamUrl) {
      return;
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    function attachThenPlay() {
      if (started) {
        playVideo();
        return;
      }
      started = true;
      if (layer) {
        layer.classList.add("is-hidden");
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        video.load();
        return;
      }
      loadHls(function () {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        } else {
          video.src = streamUrl;
          video.addEventListener("loadedmetadata", playVideo, { once: true });
          video.load();
        }
      });
    }

    if (layer) {
      layer.addEventListener("click", attachThenPlay);
    }

    video.addEventListener("click", function () {
      if (!started) {
        attachThenPlay();
      } else if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
