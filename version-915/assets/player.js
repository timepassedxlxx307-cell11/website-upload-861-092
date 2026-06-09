(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function startPlayer(box) {
        var video = box.querySelector("video");
        var button = box.querySelector(".video-cover");
        var src = box.getAttribute("data-player-src");
        var loaded = false;
        var hls = null;
        if (!video || !button || !src) {
            return;
        }
        function playVideo() {
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    box.classList.remove("is-playing");
                });
            }
        }
        function attach() {
            box.classList.add("is-playing");
            if (loaded) {
                playVideo();
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
                playVideo();
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        hls.destroy();
                        loaded = false;
                        box.classList.remove("is-playing");
                    }
                });
            } else {
                video.src = src;
                playVideo();
            }
        }
        button.addEventListener("click", attach);
        video.addEventListener("click", function () {
            if (video.paused) {
                attach();
            }
        });
    }

    ready(function () {
        Array.prototype.slice.call(document.querySelectorAll("[data-player-src]")).forEach(startPlayer);
    });
})();
