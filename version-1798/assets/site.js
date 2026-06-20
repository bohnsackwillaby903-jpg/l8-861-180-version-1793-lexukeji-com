import { H as Hls } from "./hls-dru42stk.js";

const navButton = document.querySelector(".mobile-toggle");
const mobileNav = document.querySelector(".mobile-nav");

if (navButton && mobileNav) {
    navButton.addEventListener("click", () => {
        const expanded = navButton.getAttribute("aria-expanded") === "true";
        navButton.setAttribute("aria-expanded", String(!expanded));
        mobileNav.classList.toggle("open", !expanded);
    });
}

const hero = document.querySelector("[data-hero]");

if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let activeIndex = 0;
    let timer = null;

    const activate = (index) => {
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach((slide, current) => {
            slide.classList.toggle("active", current === activeIndex);
        });
        dots.forEach((dot, current) => {
            dot.classList.toggle("active", current === activeIndex);
        });
    };

    const restart = () => {
        if (timer) {
            clearInterval(timer);
        }
        timer = setInterval(() => activate(activeIndex + 1), 5200);
    };

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            activate(index);
            restart();
        });
    });

    if (prev) {
        prev.addEventListener("click", () => {
            activate(activeIndex - 1);
            restart();
        });
    }

    if (next) {
        next.addEventListener("click", () => {
            activate(activeIndex + 1);
            restart();
        });
    }

    restart();
}

const normalize = (value) => (value || "").toString().trim().toLowerCase();

const updateFilters = () => {
    const panels = Array.from(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach((panel) => {
        const scope = panel.closest("main") || document;
        const input = panel.querySelector("[data-search-input]");
        const type = panel.querySelector("[data-type-filter]");
        const region = panel.querySelector("[data-region-filter]");
        const year = panel.querySelector("[data-year-filter]");
        const reset = panel.querySelector("[data-reset-filter]");
        const cards = Array.from(scope.querySelectorAll("[data-card]"));
        const resultCount = scope.querySelector("[data-result-count]");
        const empty = scope.querySelector("[data-filter-empty]");

        const apply = () => {
            const query = normalize(input ? input.value : "");
            const typeValue = normalize(type ? type.value : "");
            const regionValue = normalize(region ? region.value : "");
            const yearValue = normalize(year ? year.value : "");
            let visible = 0;

            cards.forEach((card) => {
                const text = normalize(card.getAttribute("data-search"));
                const cardType = normalize(card.getAttribute("data-type"));
                const cardRegion = normalize(card.getAttribute("data-region"));
                const cardYear = normalize(card.getAttribute("data-year"));
                const matched = (!query || text.includes(query)) &&
                    (!typeValue || cardType === typeValue) &&
                    (!regionValue || cardRegion === regionValue) &&
                    (!yearValue || cardYear === yearValue);

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (resultCount) {
                resultCount.textContent = String(visible);
            }

            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        };

        [input, type, region, year].forEach((element) => {
            if (element) {
                element.addEventListener("input", apply);
                element.addEventListener("change", apply);
            }
        });

        if (reset) {
            reset.addEventListener("click", () => {
                if (input) {
                    input.value = "";
                }
                if (type) {
                    type.value = "";
                }
                if (region) {
                    region.value = "";
                }
                if (year) {
                    year.value = "";
                }
                apply();
            });
        }

        apply();
    });
};

updateFilters();

const players = Array.from(document.querySelectorAll("[data-player]"));

players.forEach((shell) => {
    const video = shell.querySelector("video");
    const button = shell.querySelector("[data-play-button]");
    let hls = null;
    let started = false;

    const playVideo = async () => {
        if (!video) {
            return;
        }

        const stream = video.getAttribute("data-stream");
        if (!stream) {
            return;
        }

        shell.classList.add("is-playing");

        if (!started) {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(Hls.Events.ERROR, (_event, data) => {
                    if (!data.fatal) {
                        return;
                    }
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                        hls = null;
                    }
                });
            } else {
                video.src = stream;
            }
            started = true;
        }

        try {
            await video.play();
        } catch (_error) {
            shell.classList.remove("is-playing");
        }
    };

    if (button) {
        button.addEventListener("click", playVideo);
    }

    if (video) {
        video.addEventListener("click", () => {
            if (!started) {
                playVideo();
            }
        });
        video.addEventListener("play", () => shell.classList.add("is-playing"));
        video.addEventListener("pause", () => {
            if (video.currentTime === 0) {
                shell.classList.remove("is-playing");
            }
        });
    }
});
