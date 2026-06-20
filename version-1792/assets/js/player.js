(function () {
  var wrap = document.querySelector('[data-movie-player]');
  if (!wrap) {
    return;
  }

  var video = wrap.querySelector('video');
  var button = wrap.querySelector('[data-play-button]');
  var hlsPlayer = null;

  if (!video || !button) {
    return;
  }

  function loadVideo() {
    if (video.getAttribute('data-loaded') === '1') {
      return;
    }

    var url = video.getAttribute('data-url');
    video.setAttribute('data-loaded', '1');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsPlayer = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsPlayer.loadSource(url);
      hlsPlayer.attachMedia(video);
      return;
    }

    video.src = url;
  }

  function playVideo() {
    loadVideo();
    wrap.classList.add('is-playing');
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  button.addEventListener('click', playVideo);

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    wrap.classList.add('is-playing');
  });

  window.addEventListener('beforeunload', function () {
    if (hlsPlayer) {
      hlsPlayer.destroy();
    }
  });
})();
