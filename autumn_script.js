document.addEventListener('DOMContentLoaded', () => {
    // Шапка: тонкая линия после прокрутки
    const nav = document.getElementById('topnav');
    const onScroll = () => nav && nav.classList.toggle('scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Скидка в процентах считается из data-old / data-new — при смене цен править только их
    document.querySelectorAll('.price').forEach(p => {
        const oldP = parseFloat(p.dataset.old), newP = parseFloat(p.dataset.new);
        const save = p.querySelector('.price-save');
        if (save && oldP > newP) save.textContent = '−' + Math.round((1 - newP / oldP) * 100) + '%';
    });

    // Плавающая кнопка на телефоне: видна после первого экрана, прячется у тарифов и в футере
    const sticky = document.getElementById('sticky-cta');
    const hero = document.getElementById('hero');
    const hideZones = [document.getElementById('lots'), document.querySelector('.site-footer')];
    if (sticky && hero && 'IntersectionObserver' in window) {
        const state = { hero: true, zones: new Set() };
        const paint = () => sticky.classList.toggle('show', !state.hero && state.zones.size === 0);
        new IntersectionObserver(([e]) => { state.hero = e.isIntersecting; paint(); }).observe(hero);
        const zoneObs = new IntersectionObserver(entries => {
            entries.forEach(e => e.isIntersecting ? state.zones.add(e.target) : state.zones.delete(e.target));
            paint();
        });
        hideZones.forEach(z => z && zoneObs.observe(z));
    }

    // Появление блоков при прокрутке
    const revealObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach((el, i) => {
        el.style.transitionDelay = (i % 3) * 80 + 'ms';
        revealObs.observe(el);
    });

    // Modal Logic
    const modal = document.getElementById('confirmation-modal');
    const checkbox = document.getElementById('agree-checkbox');
    const proceedBtn = document.getElementById('modal-proceed');
    const closeX = document.getElementById('modal-close-x');

    // Close modal function
    function closeModal() {
        if (modal) modal.classList.add('hidden');
        if (checkbox) checkbox.checked = false;
        if (proceedBtn) proceedBtn.disabled = true;
    }

    // Close on X click
    if (closeX) closeX.addEventListener('click', closeModal);

    // Checkbox toggle
    if (checkbox) {
        checkbox.addEventListener('change', () => {
            if (proceedBtn) proceedBtn.disabled = !checkbox.checked;
        });
    }

    // Close on click outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

});


// Handle Buy button clicks (from onclick)
function handleBuy(tariffId) {
    const modal = document.getElementById('confirmation-modal');
    const proceedBtn = document.getElementById('modal-proceed');
    const checkbox = document.getElementById('agree-checkbox');

    // Payment links mapping
    const paymentLinks = {
        // «Осанка + Пресс» — новый тариф, ссылки на оплату добавить
        'lot1-rf': '',
        'lot1-norf': '',
        'lot4-rf': 'https://payform.ru/aabjMew/',
        'lot4-norf': 'https://app.lava.top/products/a9f6ffda-b944-4509-9914-f2b11c490bd3',
    };

    const link = paymentLinks[tariffId] || '';

    if (modal) {
        // Store the link for the proceed button
        modal.dataset.currentLink = link;
        if (checkbox) checkbox.checked = false;
        if (proceedBtn) proceedBtn.disabled = true;
        modal.classList.remove('hidden');

        // Override proceed button behavior
        proceedBtn.onclick = function () {
            if (checkbox && checkbox.checked) {
                if (link) {
                    window.location.href = link;
                } else {
                    alert('Ссылка на оплату пока не установлена для тарифа: ' + tariffId);
                }
                modal.classList.add('hidden');
                checkbox.checked = false;
                proceedBtn.disabled = true;
            }
        };
    }
}

// Document Modal Logic
const docModal = document.getElementById('document-modal');
const docCloseX = document.getElementById('doc-modal-close-x');
const docContent = document.getElementById('document-content');
const docTitle = document.getElementById('document-title');
const docNewTabBtn = document.getElementById('document-new-tab-btn');

if (docCloseX) {
    docCloseX.addEventListener('click', () => {
        docModal.classList.add('hidden');
        if (docContent) docContent.innerHTML = '';
    });
}

if (docModal) {
    docModal.addEventListener('click', (e) => {
        if (e.target === docModal) {
            docModal.classList.add('hidden');
            if (docContent) docContent.innerHTML = '';
        }
    });
}

function openDocumentModal(fileUrl, title) {
    if (docModal && docContent && docTitle) {
        docTitle.textContent = title;
        if (docNewTabBtn) {
            docNewTabBtn.href = fileUrl;
        }

        docModal.classList.remove('hidden');
        docContent.innerHTML = '<div style="text-align:center; padding: 2rem; color: #999;">Загрузка...</div>';

        fetch(fileUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(html => {
                docContent.innerHTML = html;
            })
            .catch(error => {
                console.error('Error fetching document:', error);
                let errorMsg = '<p style="text-align: center; color: #d9534f; padding: 2rem;">Не удалось загрузить документ.</p>';
                if (window.location.protocol === 'file:') {
                    errorMsg += '<p style="text-align: center; color: #666;">Браузер ограничил доступ к локальному файлу. Пожалуйста, откройте его в новом окне.</p>';
                }
                docContent.innerHTML = errorMsg;
            });
    }
}
