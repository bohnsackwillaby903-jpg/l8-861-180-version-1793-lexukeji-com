document.addEventListener("DOMContentLoaded", function () {
    const header = document.querySelector("[data-site-header]");
    const menuButton = document.querySelector("[data-menu-button]");
    const mobilePanel = document.querySelector("[data-mobile-panel]");

    function updateHeader() {
        if (!header) {
            return;
        }
        header.classList.toggle("scrolled", window.scrollY > 20);
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("open");
        });
    }

    const carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
        const previous = carousel.querySelector("[data-hero-prev]");
        const next = carousel.querySelector("[data-hero-next]");
        let index = 0;
        let timer = null;

        function showSlide(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function startTimer() {
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        function resetTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            startTimer();
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                resetTimer();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                showSlide(index - 1);
                resetTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                resetTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    const searchPanel = document.querySelector("[data-search-panel]");
    if (searchPanel) {
        const queryInput = searchPanel.querySelector("[data-filter-query]");
        const yearSelect = searchPanel.querySelector("[data-filter-year]");
        const typeSelect = searchPanel.querySelector("[data-filter-type]");
        const regionSelect = searchPanel.querySelector("[data-filter-region]");
        const resetButton = searchPanel.querySelector("[data-filter-reset]");
        const cards = Array.from(document.querySelectorAll("[data-search]"));
        const empty = document.querySelector("[data-search-empty]");
        const params = new URLSearchParams(window.location.search);

        if (queryInput && params.get("q")) {
            queryInput.value = params.get("q");
        }

        if (yearSelect && params.get("year")) {
            yearSelect.value = params.get("year");
        }

        if (typeSelect && params.get("type")) {
            typeSelect.value = params.get("type");
        }

        if (regionSelect && params.get("region")) {
            regionSelect.value = params.get("region");
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilters() {
            const query = normalize(queryInput ? queryInput.value : "");
            const year = yearSelect ? yearSelect.value : "";
            const type = typeSelect ? typeSelect.value : "";
            const region = regionSelect ? regionSelect.value : "";
            let visible = 0;

            cards.forEach(function (card) {
                const text = normalize(card.getAttribute("data-search"));
                const matchQuery = !query || text.includes(query);
                const matchYear = !year || card.getAttribute("data-year") === year;
                const matchType = !type || card.getAttribute("data-type") === type;
                const matchRegion = !region || card.getAttribute("data-region") === region;
                const shouldShow = matchQuery && matchYear && matchType && matchRegion;
                card.hidden = !shouldShow;
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [queryInput, yearSelect, typeSelect, regionSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        if (resetButton) {
            resetButton.addEventListener("click", function () {
                if (queryInput) {
                    queryInput.value = "";
                }
                if (yearSelect) {
                    yearSelect.value = "";
                }
                if (typeSelect) {
                    typeSelect.value = "";
                }
                if (regionSelect) {
                    regionSelect.value = "";
                }
                applyFilters();
            });
        }

        applyFilters();
    }
});
