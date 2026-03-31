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
            if (targetId === 'modal-placeholder') {
                const div = document.createElement('div');
                div.id = 'modal-placeholder';
                div.innerHTML = html;
                document.body.appendChild(div);
            }
        }
        
        if (targetId === 'header-placeholder') {
            initBurgerMenu();
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
    
    if (!document.getElementById('modal-placeholder')) {
        const div = document.createElement('div');
        div.id = 'modal-placeholder';
        document.body.appendChild(div);
    }
    
    includeComponent('modal-placeholder', 'components/modal.html').then(() => {
        initModal();
        // initTimedPopup(); /* disabled automatic popup */
    });

    initServiceTabs();
    initWorksSteps();
    initCalculator();
    initVideoAutoplay();

    // Глобальный слушатель кликов для открытия модального окна
    document.addEventListener('click', (e) => {
        // Добавляем все возможные варианты классов кнопок для открытия модального окна
        const triggerSelector = '.btn-call, .cll-btn, .service__btn, .calc-btn-final, .hero_btn, .hero-btn, .stroitelniymusor_krasnodae_btn_call, .welcome-element-btn, .services_card_btn, .calculate__btn, .btn-primary, .cta-banner__btn, .hero_services .hero_btn, .take-an-order-btn, .stroitelniymusor_krasnodae_btn button';
        const trigger = e.target.closest(triggerSelector);
        
        if (trigger) {
            e.preventDefault();
            
            // Если модалка еще не инициализирована (плейсхолдер пуст)
            if (!modal || !modal.querySelector('.modal__content')) {
                initModal();
                if (!modal) return;
            }

            const modalForm = modal.querySelector('.modal__form');
            const modalTitle = modal.querySelector('.modal__title');
            const modalSubtitle = modal.querySelector('.modal__subtitle');
            const modalContacts = modal.querySelector('.modal__contacts');
            const infoContainer = modal.querySelector('.modal__info-container');
            
            // РЕЖИМ ФОРМЫ: показываем форму и подзаголовок, прячем контент карточки
            if (modalForm) modalForm.style.display = 'flex';
            if (modalSubtitle) modalSubtitle.style.display = 'block';
            if (modalContacts) modalContacts.style.display = 'block';
            if (infoContainer) infoContainer.style.display = 'none';
            
            if (modalTitle) {
                modalTitle.textContent = 'Оставить заявку';
                modalTitle.style.marginBottom = '15px';
            }
            
            if (typeof openModal === 'function') {
                openModal();
            }
        }

        // Логика тоггла для карточек принципов (для мобильных и кликов)
        const cardTrigger = e.target.closest('.principles_cards_card');
        if (cardTrigger) {
            const isAlreadyActive = cardTrigger.classList.contains('active');
            // Убираем актив со всех остальных
            document.querySelectorAll('.principles_cards_card').forEach(c => c.classList.remove('active'));
            // Если не была активной - открываем, если была - закрылась
            if (!isAlreadyActive) {
                cardTrigger.classList.add('active');
            }
        } else if (!e.target.closest('.principles_cards_card')) {
            // Клик вне карточек - закрываем все
            document.querySelectorAll('.principles_cards_card').forEach(c => c.classList.remove('active'));
        }
    });
});

// ============================================================
// BURGER MENU
// ============================================================
function initBurgerMenu() {
    const burgerBtn = document.getElementById('burger-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const closeBtn = document.getElementById('mobile-nav-close');
    const backdrop = document.getElementById('mobile-nav-backdrop');
    if (!burgerBtn || !mobileNav) return;

    const openMenu = () => {
        mobileNav.classList.add('mobile-nav--open');
        burgerBtn.classList.add('burger--open');
        burgerBtn.setAttribute('aria-expanded', 'true');
        document.body.classList.add('body--locked');
    };

    const closeMenu = () => {
        mobileNav.classList.remove('mobile-nav--open');
        burgerBtn.classList.remove('burger--open');
        burgerBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('body--locked');
    };

    burgerBtn.addEventListener('click', openMenu);
    closeBtn?.addEventListener('click', closeMenu);
    backdrop?.addEventListener('click', closeMenu);
}

// ============================================================
// MODAL & TIMED POPUP
// ============================================================
let modal, openModal, closeModal;

function initModal() {
    modal = document.getElementById('contact-modal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.modal__close');

    openModal = () => {
        modal.classList.add('modal--active');
        document.body.classList.add('body--locked');
    };

    closeModal = () => {
        modal.classList.remove('modal--active');
        document.body.classList.remove('body--locked');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    const form = modal.querySelector('.modal__form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Заявка успешно отправлена! Мы свяжемся с вами в течение 15 минут.');
            closeModal();
        });
    }
}

function initTimedPopup() {
    if (sessionStorage.getItem('popupShown')) return;
    
    setTimeout(() => {
        if (modal && !modal.classList.contains('modal--active')) {
            openModal();
            const modalTitle = modal.querySelector('.modal__title');
            if (modalTitle) modalTitle.textContent = 'Нужна помощь с расчетом?';
            sessionStorage.setItem('popupShown', 'true');
        }
    }, 30000);
}

// ============================================================
// CALCULATOR LOGIC
// ============================================================
function initCalculator() {
    const volumeInput = document.getElementById('calc-volume');
    const typeSelect = document.getElementById('calc-type');
    const urgencySelect = document.getElementById('calc-urgency');
    const priceDisplay = document.getElementById('calc-price');

    if (!volumeInput || !priceDisplay) return;

    const calculate = () => {
        const volume = parseFloat(volumeInput.value) || 0;
        const typeFactor = parseFloat(typeSelect.value) || 1;
        const urgencyFactor = parseFloat(urgencySelect.value) || 1;

        let baseRate = volume > 20 ? 1800 : 2200;
        let total = volume * baseRate * typeFactor * urgencyFactor;
        
        if (total < 1990) total = 1990;

        const min = Math.round(total * 0.9);
        const max = Math.round(total * 1.1);

        priceDisplay.textContent = `${min.toLocaleString()} - ${max.toLocaleString()}₽`;
    };

    [volumeInput, typeSelect, urgencySelect].forEach(el => {
        if (el) el.addEventListener('input', calculate);
    });
    
    calculate();
}

// ============================================================
// SERVICE SECTION TABS (Expanded)
// ============================================================
function initServiceTabs() {
    const containerData = {
        '8': {
            title: 'Контейнер 8 м³ («лодочка»)',
            desc: 'Самый популярный бункер для частных домов и небольших строек. Идеален для узких проездов.',
            volume: '8 м³',
            material: 'сталь 3 мм',
            load: 'до 5 тонн',
            img: 'images/main_containers/8container.png'
        },
        '12': {
            title: 'Контейнер 12 м³',
            desc: 'Оптимальный выбор для вывоза строительного мусора после ремонта квартиры или небольшого офиса.',
            volume: '12 м³',
            material: 'сталь 3-4 мм',
            load: 'до 7 тонн',
            img: 'images/main_containers/12.jpg'
        },
        '16': {
            title: 'Контейнер 16 м³',
            desc: 'Средний объем для вывоза КГМ и строительного мусора. Подходит для демонтажных работ.',
            volume: '16 м³',
            material: 'сталь 4 мм',
            load: 'до 10 тонн',
            img: 'images/main_containers/16.jpg'
        },
        '20': {
            title: 'Контейнер 20 м³',
            desc: 'Вместительный бункер для крупных объектов. Оптимален для вывоза легкого объемного хлама.',
            volume: '20 м³',
            material: 'сталь 4 мм',
            load: 'до 12 тонн',
            img: 'images/main_containers/20.jpg'
        },
        '27': {
            title: 'Контейнер 27 м³',
            desc: 'Большой объем для серьезных задач. Усиленная конструкция для работы с тяжелым мусором.',
            volume: '27 м³',
            material: 'усиленная сталь 4-5 мм',
            load: 'до 15 тонн',
            img: 'images/main_containers/27.jpg'
        }
    };

    const tabs = document.querySelectorAll('.service__tab');
    if (!tabs.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const id = tab.dataset.tab;
            const data = containerData[id];
            if (!data) return;

            tabs.forEach(t => t.classList.remove('service__tab--active'));
            tab.classList.add('service__tab--active');

            const titleEl = document.querySelector('.service__title');
            const descEl = document.getElementById('cont-desc');
            const volEl = document.getElementById('cont-volume');
            const matEl = document.getElementById('cont-material');
            const loadEl = document.getElementById('cont-load');
            const imgEl = document.getElementById('cont-img-1');

            if (titleEl) titleEl.textContent = data.title;
            if (descEl) descEl.textContent = data.desc;
            if (volEl) volEl.textContent = data.volume;
            if (matEl) matEl.textContent = data.material;
            if (loadEl) loadEl.textContent = data.load;
            if (imgEl && data.img) imgEl.src = data.img;
        });
    });
}

// ============================================================
// WORKS STEPS TABS
// ============================================================
function initWorksSteps() {
    const btns = document.querySelectorAll('.steps_header_btn');
    const titleEl = document.querySelector('.works_steps_body_tittle');
    const descEl = document.querySelector('.works_steps_body_desk');
    const imgEl = document.querySelector('.works_steps_body_img');
    
    if (!btns.length || !titleEl) return;

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('steps_header_btn_active'));
            btn.classList.add('steps_header_btn_active');
            // Simplified for brevity, assumes data-title/data-desc/data-img on btn
            if (btn.dataset.title) titleEl.textContent = btn.dataset.title;
            if (btn.dataset.desc) descEl.textContent = btn.dataset.desc;
            if (btn.dataset.img) imgEl.src = btn.dataset.img;
        });
    });
}

// ============================================================
// VIDEO AUTOPLAY FIX
// ============================================================
function initVideoAutoplay() {
    const videos = document.querySelectorAll('video');
    videos.forEach(v => {
        v.muted = true;
        v.play().catch(e => console.log('Autoplay issue:', e));
    });
}
