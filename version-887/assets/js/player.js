(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

        players.forEach(function (wrapper) {
            var video = wrapper.querySelector("video");
            var overlay = wrapper.querySelector(".player-overlay");
            var button = wrapper.querySelector(".play-button");
            var src = wrapper.getAttribute("data-src");
            var hls = null;
            var loaded = false;

            if (!video || !src) {
                return;
            }

            function loadVideo() {
                if (loaded) {
                    return;
                }

                loaded = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        maxBufferLength: 30,
                        enableWorker: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else {
                    video.src = src;
                }
            }

            function start() {
                loadVideo();
                video.controls = true;

                if (overlay) {
                    overlay.classList.add("is-hidden");
                }

                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        if (overlay) {
                            overlay.classList.remove("is-hidden");
                        }
                    });
                }
            }

            function stopHls() {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            }

            if (overlay) {
                overlay.addEventListener("click", start);
            }

            if (button) {
                button.addEventListener("click", start);
            }

            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });

            window.addEventListener("pagehide", stopHls);
        });
    });
})();
