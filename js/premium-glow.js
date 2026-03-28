
/**
 * Ultimate Premium Backgrounds - Version 1.5
 * Robust background extraction and scroll parallax.
 */
const initUltimateGlow = () => {
    // 4. Оставь анимации ТОЛЬКО на главной странице
    const path = window.location.pathname;
    const isindex = path.endsWith('index.html') || path === '/' || path.endsWith('index.html') || path === '';
    
    if (!isindex) {
        console.log("Premium Glow: Disabled on non-index pages.");
        return;
    }

    console.log("Premium Glow 1.5: Initializing...");
    const sections = document.querySelectorAll('.premium-glow');

    if (!sections.length) return;

    sections.forEach((section, index) => {
        if (section.querySelector('.parallax-bg-image')) return;

        // 1. EXTRACT DATA
        const style = window.getComputedStyle(section);
        const bgImg = style.backgroundImage;
        const videoImg = section.querySelector('.process__video');

        let src = null;
        if (videoImg) {
            src = videoImg.src;
            videoImg.style.display = 'none';
        } else if (bgImg && bgImg !== 'none') {
            const match = bgImg.match(/url\(['"]?(.*?)['"]?\)/);
            if (match) src = match[1];
        }

        console.log(`Section ${index} - Source extracted:`, src ? src.slice(-20) : "none");

        // 2. CREATE MOVING LAYER
        if (src) {
            const imgLayer = document.createElement('div');
            imgLayer.className = 'parallax-bg-image';
            imgLayer.style.backgroundImage = `url("${src}")`;

            // Clean section to avoid double vision
            section.style.background = 'none';
            section.prepend(imgLayer);
        }

        // 3. CREATE GLOW LAYER
        const glowLayer = document.createElement('div');
        glowLayer.className = 'premium-glow-visuals';
        section.prepend(glowLayer);
    });

    // 4. SCROLL PARALLAX
    const updateParallax = () => {
        const scrollY = window.pageYOffset;
        const vh = window.innerHeight;

        sections.forEach(section => {
            const img = section.querySelector('.parallax-bg-image');
            if (!img) return;

            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + scrollY;

            if (rect.top < vh && rect.bottom > 0) {
                const speed = 0.5; // Intensity
                const offset = (scrollY - sectionTop) * speed;
                img.style.transform = `translate3d(0, ${offset}px, 0)`;
            }
        });
    };

    window.addEventListener('scroll', updateParallax, { passive: true });
    updateParallax();
};

// Use window.onload to be 100% sure all CSS is loaded and applied
window.addEventListener('load', initUltimateGlow);
// Back-up DOMContentLoaded
document.addEventListener('DOMContentLoaded', initUltimateGlow);
