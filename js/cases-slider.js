document.addEventListener('DOMContentLoaded', function () {
    const casesSwiper = new Swiper('.real-cases-swiper', {
        loop: true,
        spaceBetween: 60,
        slidesPerView: 'auto',
        centeredSlides: true,
        autoplay: {
            delay: 6000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },
        speed: 800,
        pagination: {
            el: '.cases-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.cases-next',
            prevEl: '.cases-prev',
        }
    });

    // Optional: add subtle paralax or other interactivity if needed
});
