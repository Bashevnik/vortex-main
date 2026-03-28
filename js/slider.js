/**
 * Momentum Drag Slider
 * - Free scroll, no snap-back
 * - Inertia on mouse drag release
 * - Touch support
 * - Arrow buttons for precise step navigation
 */
document.addEventListener('DOMContentLoaded', () => {

    function initSlider({ sliderSelector, nextBtnSelector, prevBtnSelector }) {
        const slider = document.querySelector(sliderSelector);
        if (!slider) return;

        const nextBtn = nextBtnSelector ? document.querySelector(nextBtnSelector) : null;
        const prevBtn = prevBtnSelector ? document.querySelector(prevBtnSelector) : null;

        let isDown = false;
        let startX;
        let startScrollLeft;
        let velX = 0;
        let lastX;
        let lastTime;
        let rafId;

        // Prevent drag on images
        slider.querySelectorAll('img').forEach(img => {
            img.addEventListener('dragstart', e => e.preventDefault());
        });

        // ---- MOUSE EVENTS ----
        slider.addEventListener('mousedown', (e) => {
            cancelAnimationFrame(rafId);
            isDown = true;
            slider.style.cursor = 'grabbing';
            startX = e.pageX;
            startScrollLeft = slider.scrollLeft;
            lastX = e.pageX;
            lastTime = Date.now();
            velX = 0;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const dx = e.pageX - startX;
            slider.scrollLeft = startScrollLeft - dx;

            // Track velocity
            const now = Date.now();
            const dt = now - lastTime;
            if (dt > 0) {
                velX = (e.pageX - lastX) / dt;
            }
            lastX = e.pageX;
            lastTime = now;
        });

        document.addEventListener('mouseup', () => {
            if (!isDown) return;
            isDown = false;
            slider.style.cursor = 'grab';
            startMomentum();
        });

        // ---- TOUCH EVENTS ----
        let touchStartX;
        let touchStartScrollLeft;
        let touchLastX;
        let touchLastTime;
        let touchVelX = 0;

        slider.addEventListener('touchstart', (e) => {
            cancelAnimationFrame(rafId);
            touchStartX = e.touches[0].pageX;
            touchStartScrollLeft = slider.scrollLeft;
            touchLastX = touchStartX;
            touchLastTime = Date.now();
            touchVelX = 0;
        }, { passive: true });

        slider.addEventListener('touchmove', (e) => {
            const dx = e.touches[0].pageX - touchStartX;
            slider.scrollLeft = touchStartScrollLeft - dx;

            const now = Date.now();
            const dt = now - touchLastTime;
            if (dt > 0) {
                touchVelX = (e.touches[0].pageX - touchLastX) / dt;
            }
            touchLastX = e.touches[0].pageX;
            touchLastTime = now;
        }, { passive: true });

        slider.addEventListener('touchend', () => {
            velX = touchVelX;
            startMomentum();
        });

        // ---- MOMENTUM ----
        function startMomentum() {
            cancelAnimationFrame(rafId);
            const friction = 0.95; // Inertia factor: softer inertia, smoother glide

            function step() {
                if (Math.abs(velX) < 0.5) return; // Stop when velocity is tiny
                slider.scrollLeft -= velX * 16; // ~1 frame at 60fps
                velX *= friction;
                rafId = requestAnimationFrame(step);
            }
            rafId = requestAnimationFrame(step);
        }

        // ---- ARROW BUTTONS ----
        function getStep() {
            const card = slider.querySelector('[class*="__card"], [class*="-card"]');
            if (card) {
                const gap = parseInt(window.getComputedStyle(slider).gap) || 0;
                return card.offsetWidth + gap;
            }
            return slider.offsetWidth * 0.8;
        }

        function smoothScrollTo(target) {
            cancelAnimationFrame(rafId);
            const start = slider.scrollLeft;
            const dist = target - start;
            const duration = 400;
            const startTime = performance.now();

            function animate(now) {
                const elapsed = now - startTime;
                const t = Math.min(elapsed / duration, 1);
                // Ease-out cubic
                const ease = 1 - Math.pow(1 - t, 3);
                slider.scrollLeft = start + dist * ease;
                if (t < 1) rafId = requestAnimationFrame(animate);
            }
            rafId = requestAnimationFrame(animate);
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                smoothScrollTo(slider.scrollLeft + getStep());
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                smoothScrollTo(slider.scrollLeft - getStep());
            });
        }
    }

    // ---- INIT SLIDERS ----

    initSlider({
        sliderSelector: '.clients__slider',
        nextBtnSelector: '.clients__nav-next',
        prevBtnSelector: '.clients__nav-prev'
    });

    initSlider({
        sliderSelector: '.reviews__cards',
        nextBtnSelector: '.reviews__nav .reviews__nav-btn:last-child',
        prevBtnSelector: '.reviews__nav .reviews__nav-btn:first-child'
    });

});
