import { H as Hls } from './hls.js';

const ready = (callback) => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
};

function setupMobileNavigation() {
    const toggle = document.querySelector('[data-mobile-toggle]');
    const panel = document.querySelector('[data-mobile-panel]');

    if (!toggle || !panel) {
        return;
    }

    toggle.addEventListener('click', () => {
        panel.classList.toggle('is-open');
    });
}

function setupHeroSlider() {
    const hero = document.querySelector('[data-hero]');

    if (!hero) {
        return;
    }

    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;

    const showSlide = (nextIndex) => {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === index);
        });
    };

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            const nextIndex = Number(dot.dataset.heroDot || 0);
            showSlide(nextIndex);
        });
    });

    if (slides.length > 1) {
        window.setInterval(() => showSlide(index + 1), 5500);
    }
}

function setupFiltering() {
    const panels = document.querySelectorAll('[data-filter-panel]');

    panels.forEach((panel) => {
        const grid = panel.parentElement.querySelector('[data-card-grid]');
        const input = panel.querySelector('[data-grid-search]');
        const sort = panel.querySelector('[data-grid-sort]');
        const count = panel.querySelector('[data-result-count]');

        if (!grid || !input) {
            return;
        }

        const cards = Array.from(grid.querySelectorAll('[data-movie-card]'));
        const initialOrder = new Map(cards.map((card, cardIndex) => [card, cardIndex]));
        const params = new URLSearchParams(window.location.search);
        const queryFromUrl = params.get('q');

        if (queryFromUrl) {
            input.value = queryFromUrl;
        }

        const update = () => {
            const keyword = input.value.trim().toLowerCase();
            let visibleCount = 0;

            cards.forEach((card) => {
                const haystack = (card.dataset.search || '').toLowerCase();
                const isMatch = !keyword || haystack.includes(keyword);
                card.classList.toggle('is-hidden', !isMatch);
                if (isMatch) {
                    visibleCount += 1;
                }
            });

            if (sort) {
                const sortedCards = [...cards].sort((a, b) => {
                    const mode = sort.value;

                    if (mode === 'views') {
                        return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
                    }

                    if (mode === 'year') {
                        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                    }

                    if (mode === 'title') {
                        return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
                    }

                    return (initialOrder.get(a) || 0) - (initialOrder.get(b) || 0);
                });

                sortedCards.forEach((card) => grid.appendChild(card));
            }

            if (count) {
                count.textContent = `${visibleCount} 部影片`;
            }
        };

        input.addEventListener('input', update);
        if (sort) {
            sort.addEventListener('change', update);
        }

        update();
    });
}

function attachHls(video, source) {
    if (!source) {
        return;
    }

    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        video._hlsInstance = hls;
        return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
    }

    video.src = source;
}

function setupPlayers() {
    const players = document.querySelectorAll('[data-video-src]');

    players.forEach((player) => {
        const video = player.querySelector('video');
        const button = player.querySelector('[data-play-button]');
        const source = player.dataset.videoSrc;

        if (!video || !button || !source) {
            return;
        }

        const startPlayback = () => {
            if (!video.dataset.hlsReady) {
                attachHls(video, source);
                video.dataset.hlsReady = 'true';
            }

            player.classList.add('is-playing');
            video.play().catch(() => {
                player.classList.remove('is-playing');
                button.querySelector('strong').textContent = '再次点击播放';
            });
        };

        button.addEventListener('click', startPlayback);
        video.addEventListener('play', () => player.classList.add('is-playing'));
        video.addEventListener('pause', () => {
            if (video.currentTime === 0 || video.ended) {
                player.classList.remove('is-playing');
            }
        });
    });
}

function setupPlayerScrollLinks() {
    document.querySelectorAll('[data-scroll-player]').forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const player = document.querySelector('.player-card');
            if (player) {
                player.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });
}

ready(() => {
    setupMobileNavigation();
    setupHeroSlider();
    setupFiltering();
    setupPlayers();
    setupPlayerScrollLinks();
});
