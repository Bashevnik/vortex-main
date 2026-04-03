/**
 * Premium Parallax Backgrounds — v2.1
 * Параллакс работает только на главной странице (index.html).
 */
const initUltimateGlow = () => {
    // Параллакс только на главной странице
    const path = window.location.pathname;
    const isIndexPage = path === '/' || path === '' || path.endsWith('/index.html') || path.endsWith('index.html');
    if (!isIndexPage) return;

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

    const SPEED = 0.25; // Снижено для повышения качества изображений (меньше растягивание)

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

            // Расчет смещения центра секции относительно центра экрана
            const sectionCenter = sectionTop + sectionH / 2;
            const scrollCenter = scrollY + vh / 2;
            
            // Смещение (0 когда секция по центру экрана)
            let offset = (scrollCenter - sectionCenter) * SPEED;

            // Ограничиваем смещение, чтобы картинка не "уходила" за края (буфер 50vh в СSS)
            // Мы оставляем запас в 5vh для надежности
            const maxOffset = vh * 0.18; // Запас под overhang 40vh в CSS
            const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, offset));

            // Применяем трансформ с учетом начального центрирования (-50%, -50%)
            img.style.transform = `translate3d(-50%, calc(-50% + ${clampedOffset.toFixed(2)}px), 0) scale(1.05)`;
        });
    };

    window.addEventListener('scroll', updateParallax, { passive: true });
    window.addEventListener('resize', updateParallax, { passive: true });
    updateParallax();
};

window.addEventListener('load', initUltimateGlow);
document.addEventListener('DOMContentLoaded', initUltimateGlow);
