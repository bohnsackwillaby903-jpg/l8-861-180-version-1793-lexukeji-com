function setupMoviePlayer(video, button, source) {
    if (!video || !button || !source) {
        return;
    }

    let ready = false;
    let hlsInstance = null;

    function attachSource() {
        if (ready) {
            return;
        }

        ready = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls();
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function start() {
        attachSource();
        button.classList.add("hidden");
        video.controls = true;
        const attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {
                button.classList.remove("hidden");
            });
        }
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
        if (!ready || video.paused) {
            start();
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
