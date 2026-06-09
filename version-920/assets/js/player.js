(function () {
  window.initMoviePlayer = function (source) {
    var video = document.getElementById('moviePlayer');
    var cover = document.querySelector('.player-cover');
    var status = document.querySelector('.player-status');
    var hls = null;
    var ready = false;

    if (!video || !source) {
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text || '';
      }
    }

    function prepare() {
      if (ready) {
        return;
      }
      ready = true;
      setStatus('正在加载');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放暂不可用');
          }
        });
      } else {
        setStatus('播放暂不可用');
      }
    }

    function play() {
      prepare();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          setStatus('点击播放');
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
      setStatus('');
    });
    video.addEventListener('pause', function () {
      setStatus('');
    });
    video.addEventListener('ended', function () {
      if (cover) {
        cover.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
