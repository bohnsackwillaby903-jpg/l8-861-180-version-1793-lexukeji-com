(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-menu]");
    if (menuButton && menu) {
      menuButton.addEventListener("click", function () {
        menu.classList.toggle("open");
      });
    }

    var backTop = document.querySelector("[data-back-top]");
    if (backTop) {
      window.addEventListener("scroll", function () {
        if (window.scrollY > 360) {
          backTop.classList.add("visible");
        } else {
          backTop.classList.remove("visible");
        }
      });
      backTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var index = 0;
      var timer = null;
      var show = function (next) {
        index = next % slides.length;
        if (index < 0) {
          index = slides.length - 1;
        }
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      };
      var play = function () {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          if (timer) {
            window.clearInterval(timer);
          }
          show(i);
          play();
        });
      });
      if (slides.length > 1) {
        play();
      }
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var scope = panel.parentElement;
      var input = panel.querySelector("[data-filter-search]");
      var year = panel.querySelector("[data-filter-year]");
      var type = panel.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-item"));
      var filter = function () {
        var q = input ? input.value.trim().toLowerCase() : "";
        var y = year ? year.value : "";
        var t = type ? type.value : "";
        cards.forEach(function (card) {
          var text = [
            card.dataset.title || "",
            card.dataset.year || "",
            card.dataset.type || "",
            card.dataset.region || "",
            card.dataset.genre || "",
            card.dataset.category || "",
            card.textContent || ""
          ].join(" ").toLowerCase();
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (y && card.dataset.year !== y) {
            ok = false;
          }
          if (t && card.dataset.type !== t) {
            ok = false;
          }
          card.classList.toggle("is-filter-hidden", !ok);
        });
      };
      [input, year, type].forEach(function (el) {
        if (el) {
          el.addEventListener("input", filter);
          el.addEventListener("change", filter);
        }
      });
    });
  });
})();
