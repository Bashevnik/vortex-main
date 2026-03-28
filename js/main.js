// ============================================================
// КОМПОНЕНТНАЯ ЗАГРУЗКА
// ============================================================
async function includeComponent(targetId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Не удалось загрузить: ${filePath}`);
        const html = await response.text();
        const placeholder = document.getElementById(targetId);
        if (placeholder) {
            placeholder.innerHTML = html;
        } else {
            // If placeholder not found, create it at end of body if it's the modal
            if (targetId === 'modal-placeholder') {
                const div = document.createElement('div');
                div.id = 'modal-placeholder';
                div.innerHTML = html;
                document.body.appendChild(div);
            }
        }
        
        // Инициализируем зависимые модули после загрузки хедера
        if (targetId === 'header-placeholder') {
            initBurgerMenu();
            initMobileAccordion();
        }
        
        return Promise.resolve();
    } catch (error) {
        console.error('Ошибка загрузки компонента:', error);
        return Promise.reject(error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    includeComponent('header-placeholder', 'components/header.html');
    includeComponent('footer-placeholder', 'components/footer.html');
    
    // Create modal placeholder if it doesn't exist
    if (!document.getElementById('modal-placeholder')) {
        const div = document.createElement('div');
        div.id = 'modal-placeholder';
        document.body.appendChild(div);
    }
    
    includeComponent('modal-placeholder', 'components/modal.html').then(() => {
        initModal();
    });

    initServiceTabs();
    initWorksSteps();
});

// ============================================================
// BURGER MENU
// ============================================================
function initBurgerMenu() {
    const burgerBtn = document.getElementById('burger-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const closeBtn = document.getElementById('mobile-nav-close');
    const backdrop = document.getElementById('mobile-nav-backdrop');
    const panel = mobileNav?.querySelector('.mobile-nav__panel');
    const navLinks = mobileNav?.querySelectorAll('.mobile-nav__link, .mobile-nav__call');

    if (!burgerBtn || !mobileNav) return;

    // --- Utilities ---
    const openMenu = () => {
        mobileNav.classList.add('mobile-nav--open');
        mobileNav.setAttribute('aria-hidden', 'false');
        burgerBtn.setAttribute('aria-expanded', 'true');
        burgerBtn.classList.add('burger--open');
        document.body.classList.add('body--locked');
        // Focus trap: move focus into panel
        setTimeout(() => panel?.focus(), 50);
    };

    const closeMenu = () => {
        mobileNav.classList.remove('mobile-nav--open');
        mobileNav.setAttribute('aria-hidden', 'true');
        burgerBtn.setAttribute('aria-expanded', 'false');
        burgerBtn.classList.remove('burger--open');
        document.body.classList.remove('body--locked');
        burgerBtn.focus(); // Return focus to trigger
    };

    // --- Events ---
    burgerBtn.addEventListener('click', openMenu);
    closeBtn?.addEventListener('click', closeMenu);

    // Close when any nav link is clicked (excluding the accordion trigger itself)
    navLinks?.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.classList.contains('mobile-nav__accordion-btn')) return;
            closeMenu();
        });
    });

    // Also close on sublink click
    mobileNav?.querySelectorAll('.mobile-nav__sublink').forEach(sublink => {
        sublink.addEventListener('click', closeMenu);
    });

    // Close on backdrop click
    backdrop?.addEventListener('click', closeMenu);

    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileNav.classList.contains('mobile-nav--open')) {
            closeMenu();
        }
    });

    // Highlight active page link
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    mobileNav?.querySelectorAll('.mobile-nav__link[href]').forEach(link => {
        const href = link.getAttribute('href').split('/').pop();
        if (href && href === currentPath) {
            link.classList.add('is-active');
        }
    });

    // Focus trap within panel
    panel?.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        const focusable = [...panel.querySelectorAll(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    });
}

// ============================================================
// MODAL
// ============================================================
let modal, openModal, closeModal;

function initModal() {
    modal = document.getElementById('contact-modal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.modal__close');

    openModal = () => {
        modal.classList.add('modal--active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('body--locked');
    };

    closeModal = () => {
        modal.classList.remove('modal--active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('body--locked');
    };

    // Close on X
    closeBtn?.addEventListener('click', closeModal);

    // Backdrop close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // ESC close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('modal--active')) {
            closeModal();
        }
    });

    // Delegation to handle ALL call buttons across ALL pages and dynamically loaded content
    document.addEventListener('click', (e) => {
        // Broad list of selectors used for modal triggers in the project
        const triggers = [
            '.btn-call',
            '.service__btn',
            '.hero_btn',
            '.hero__btn',
            '.calculate__btn',
            '.cta-banner__btn',
            '.cll-btn',
            '.services_card_btn',
            '[data-modal-open]'
        ];
        
        if (e.target.closest(triggers.join(','))) {
            e.preventDefault();
            if (openModal) openModal();
        }
    });

    // Form submit
    const form = modal.querySelector('.modal__form');
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Заявка успешно отправлена!');
        closeModal();
    });
}

// ============================================================
// SERVICE SECTION TABS
// ============================================================
function initServiceTabs() {
    const containerData = {
        '8': {
            title: 'Контейнер 8 м³ («лодочка»)',
            desc: 'Это самый популярный и доступный контейнер для частных заказчиков. Благодаря компактности он идеален для узких улиц, дач и придомовых территорий, где обычные баки слишком малы, а крупногабаритная техника не развернется. Инженеры «ЭКО-Вортекс» производят эти бункеры из цельнолистовой стали (1,5–4 мм). Конструкция надежно усилена ребрами жесткости, защищена двойным слоем краски и полностью совместима со стандартными подъемными механизмами.',
            volume: '8 м³',
            material: 'сталь 3-4 мм',
            load: '4500-5800 кг',
            coating: 'грунт + антикоррозионная эмаль',
            dims: '3450×1900×1500 мм',
            img: 'images/main_containers/8container.png'
        },
        '27': {
            title: 'Контейнер 27 м³',
            desc: 'Самый вместительный бункер в арсенале «ЭКО-Вортекс», разработанный специально для вывоза крупногабаритного строительного мусора. Грузоподъемность этой модели идентична 16-кубовому аналогу, но за счет увеличенного объема она идеально решает задачи масштабных утилизаций. Наши инженеры усилили конструкцию дополнительным продольным ребром жесткости, что надежно защищает бункер от деформаций при высоких нагрузках.',
            volume: '27 м³',
            material: 'усиленная сталь 4-5 мм',
            load: '12000-15000 кг',
            coating: 'грунт + антикоррозионная эмаль',
            dims: '6500×2500×2200 мм',
            img: 'images/main_containers/8container.png'
        }
    };

    const tabs = document.querySelectorAll('.service__tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const id = tab.dataset.tab;
            const data = containerData[id];

            tabs.forEach(t => t.classList.remove('service__tab--active'));
            tab.classList.add('service__tab--active');

            const descEl = document.getElementById('cont-desc');
            const gridEl = document.querySelector('.service__grid');
            const volumeEl = document.getElementById('cont-volume');
            const materialEl = document.getElementById('cont-material');
            const loadEl = document.getElementById('cont-load');
            const coatingEl = document.getElementById('cont-coating');
            const dimsEl = document.getElementById('cont-dims');

            descEl?.classList.add('is-animating');
            gridEl?.classList.add('is-animating');

            // Cross-fade images
            const img1 = document.getElementById('cont-img-1');
            const img2 = document.getElementById('cont-img-2');
            const activeImg = img1?.classList.contains('active') ? img1 : img2;
            const nextImg = img1?.classList.contains('active') ? img2 : img1;
            if (nextImg) nextImg.src = data.img;

            setTimeout(() => {
                const titleEl = document.querySelector('.service__title');
                if (titleEl) titleEl.textContent = data.title;
                if (descEl) descEl.textContent = data.desc;
                if (volumeEl) volumeEl.textContent = data.volume;
                if (materialEl) materialEl.textContent = data.material;
                if (loadEl) loadEl.textContent = data.load;
                if (coatingEl) coatingEl.textContent = data.coating;
                if (dimsEl) dimsEl.textContent = data.dims;

                descEl?.classList.remove('is-animating');
                gridEl?.classList.remove('is-animating');

                descEl?.classList.add('is-entering');
                gridEl?.classList.add('is-entering');

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        descEl?.classList.remove('is-entering');
                        gridEl?.classList.remove('is-entering');
                    });
                });

                if (nextImg) nextImg.classList.add('active');
                if (activeImg) activeImg.classList.remove('active');
            }, 150);
        });
    });
}

// ============================================================
// MOBILE ACCORDION
// ============================================================
function initMobileAccordion() {
    const accordionBtn = document.querySelector('.mobile-nav__accordion-btn');
    const accordionItem = document.querySelector('.mobile-nav__accordion');

    if (!accordionBtn || !accordionItem) return;

    accordionBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = accordionItem.classList.contains('mobile-nav__accordion--open');

        // Toggle current
        accordionItem.classList.toggle('mobile-nav__accordion--open');
        accordionBtn.setAttribute('aria-expanded', !isOpen);
    });
}





// ============================================================
// WORKS STEPS TABS
// ============================================================
function initWorksSteps() {
    const stepsData = {
        '1': {
            title: '1 этап работы',
            desc: 'Порядок работы и доставка контейнеров. На начальном этапе, после оперативного оформления заказа через менеджера «Эко-Вортекс», контейнер для строительного мусора доставляется точно по указанному адресу. Бункер остается на вашем объекте до момента его полного наполнения, обеспечивая удобство и чистоту в процессе проведения работ. Компания «Эко-Вортекс» доставляет контейнеры на любые площадки по требованию заказчика: от масштабных строительных пятен до частных домов и квартир. Если вам требуется вывоз мусора после ремонта или организации субботника для наведения порядка во дворе — наши решения идеально справятся с этой задачей. После завершения загрузки мы берем на себя официальную утилизацию отходов, гарантируя выполнение всех обязательств точно в срок.',
            img: 'images/works_steps1.png'
        },
        '2': {
            title: '2 этап работы',
            desc: 'Сегодня на рынке вывоза строительного мусора нередко встречаются подозрительно низкие цены от нелегальных перевозчиков. Важно учитывать, что деятельность по транспортировке отходов подлежит обязательному лицензированию. Работа с фирмами без разрешительных документов перекладывает ответственность на заказчика и может привести к серьезным штрафам за несанкционированные свалки. В компании «Эко-Вортекс» процесс организован безупречно: как только контейнер наполнен, наш водитель оперативно забирает емкость с площадки. Мы обеспечиваем официальный вывоз и гарантируем, что утилизация отходов будет проведена в полном соответствии с действующими экологическими стандартами и законодательством РФ.',
            img: 'images/works_steps2.png'
        },
        '3': {
            title: '3 этап работы',
            desc: 'На данном этапе все отходы, вывезенные с объекта заказчика, проходят процедуру официальной утилизации. В компании «Эко-Вортекс» этот процесс организован в строгом соответствии с экологическими требованиями, что гарантирует полное соблюдение законодательных норм и чистоту вашего проекта перед проверяющими органами. Мы берем на себя все обязательства по корректному завершению цикла обращения со строительным мусором. Конечным результатом нашей работы является безопасная и своевременная утилизация всех типов отходов, подтвержденная необходимыми документами. Выбирая нас, вы получаете уверенность в том, что весь процесс выполнен профессионально и ответственно.',
            img: 'images/works_steps3.png'
        }
    };

    const btns = document.querySelectorAll('.steps_header_btn');
    const titleEl = document.querySelector('.works_steps_body_tittle');
    const descEl = document.querySelector('.works_steps_body_desk');
    const imgEl = document.querySelector('.works_steps_body_img');

    if (!btns.length || !titleEl) return;

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const stepId = btn.dataset.step;
            const data = stepsData[stepId];

            if (!data) return;

            // Update buttons state
            btns.forEach(b => b.classList.remove('steps_header_btn_active'));
            btn.classList.add('steps_header_btn_active');

            // Update content
            titleEl.textContent = data.title;
            descEl.textContent = data.desc;
            imgEl.src = data.img;
        });
    });
}




// ============================================================
// Principles Cards Toggle (About Page)
// ============================================================
function initPrinciplesToggle() {
    const cards = document.querySelectorAll('.principles_cards_card');
    if (!cards.length) return;

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const isActive = card.classList.contains('active');
            cards.forEach(c => c.classList.remove('active'));
            if (!isActive) card.classList.add('active');
        });
    });
}

// ============================================================
// Initialization
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    initWorksSteps();
    initPrinciplesToggle();
});
