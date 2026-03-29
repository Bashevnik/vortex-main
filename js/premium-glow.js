/**
 * Premium Parallax Backgrounds — v2.1
 * Reverted to classic translate3d but with fixed centering.
 */
const initUltimateGlow = () => {
    const sections = document.querySelectorAll('.premium-glow');
    if (!sections.length) return;

    sections.forEach((section) => {
        if (section.querySelector('.parallax-bg-image')) return;

        const style = window.getComputedStyle(section);
        const bgImg = style.backgroundImage;
        const videoEl = section.querySelector('.process__video');

        let src = null;
        if (videoEl) {
            src = videoEl.src;
            videoEl.style.display = 'none';
        } else if (bgImg && bgImg !== 'none') {
            const matches = [...bgImg.matchAll(/url\(['"]?(.*?)['"]?\)/g)];
            if (matches.length) src = matches[matches.length - 1][1];
        }

        if (src) {
            const imgLayer = document.createElement('div');
            imgLayer.className = 'parallax-bg-image';
            imgLayer.style.backgroundImage = `url("${src}")`;
            section.style.background = 'none';
            section.prepend(imgLayer);
        }

        const glowLayer = document.createElement('div');
        glowLayer.className = 'premium-glow-visuals';
        section.prepend(glowLayer);
    });

    const SPEED = 0.4; // Нормальная динамика (как была раньше)

    const updateParallax = () => {
        const scrollY = window.pageYOffset;
        const vh = window.innerHeight;

        sections.forEach(section => {
            const img = section.querySelector('.parallax-bg-image');
            if (!img) return;

            const rect = section.getBoundingClientRect();
            if (rect.top >= vh || rect.bottom <= 0) return;

            const sectionTop = rect.top + scrollY;
            const sectionH = section.offsetHeight;

            // offset=0 когда секция ровно по центру экрана
            const offset = (scrollY - sectionTop - (vh / 2 - sectionH / 2)) * SPEED;

            img.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
        });
    };

    window.addEventListener('scroll', updateParallax, { passive: true });
    window.addEventListener('resize', updateParallax, { passive: true });
    updateParallax();
};

window.addEventListener('load', initUltimateGlow);
document.addEventListener('DOMContentLoaded', initUltimateGlow);
