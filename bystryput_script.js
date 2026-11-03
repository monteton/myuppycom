const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis = null;

document.addEventListener('DOMContentLoaded', () => {
    // Плавный скролл (Lenis) в связке с GSAP ScrollTrigger
    const hasGsap = window.gsap && window.ScrollTrigger;
    if (hasGsap) gsap.registerPlugin(ScrollTrigger);
    if (!reduceMotion && window.Lenis) {
        lenis = new Lenis({ duration: 1.1, easing: t => 1 - Math.pow(1 - t, 4) });
        if (hasGsap) {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add(time => lenis.raf(time * 1000));
            gsap.ticker.lagSmoothing(0);
        } else {
            const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
            requestAnimationFrame(raf);
        }
    }

    // Якорные ссылки
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        const id = a.getAttribute('href');
        if (id.length < 2) return;
        a.addEventListener('click', e => {
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            if (lenis) lenis.scrollTo(target, { offset: -16 });
            else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
        });
    });

    // Появление блоков, один раз
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('in');
            revealObserver.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => {
        const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
        const i = siblings.indexOf(el);
        if (i > 0) el.style.transitionDelay = Math.min(i * 80, 320) + 'ms';
        revealObserver.observe(el);
    });

    // Крупный заголовок акции: слова загораются по одному
    const words = document.querySelector('[data-words]');
    if (words) {
        words.innerHTML = words.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
        const spans = [...words.querySelectorAll('.w')];
        if (hasGsap && !reduceMotion) {
            ScrollTrigger.create({
                trigger: words,
                start: 'top 85%',
                end: 'bottom 50%',
                onUpdate: self => {
                    const lit = Math.round(self.progress * spans.length);
                    spans.forEach((s, i) => s.classList.toggle('on', i < lit));
                }
            });
        } else {
            spans.forEach(s => s.classList.add('on'));
        }
    }

    // Лёгкий параллакс фото в hero
    const heroImg = document.querySelector('[data-parallax]');
    if (heroImg && hasGsap && !reduceMotion) {
        gsap.fromTo(heroImg, { yPercent: -4 }, {
            yPercent: 6,
            ease: 'none',
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
        });
    }

    // Модалка подтверждения
    const modal = document.getElementById('confirmation-modal');
    const checkbox = document.getElementById('agree-checkbox');
    const proceedBtn = document.getElementById('modal-proceed');
    const closeX = document.getElementById('modal-close-x');

    function closeModal() {
        if (modal) modal.classList.add('hidden');
        if (checkbox) checkbox.checked = false;
        if (proceedBtn) proceedBtn.disabled = true;
    }

    if (closeX) closeX.addEventListener('click', closeModal);
    if (checkbox) {
        checkbox.addEventListener('change', () => {
            if (proceedBtn) proceedBtn.disabled = !checkbox.checked;
        });
    }
    if (modal) {
        modal.addEventListener('click', e => {
            if (e.target === modal) closeModal();
        });
    }
});


function toggleDetails(button) {
    const details = button.nextElementSibling;
    if (details.classList.contains('hidden')) {
        details.classList.remove('hidden');
        button.textContent = 'СВЕРНУТЬ';
    } else {
        details.classList.add('hidden');
        button.textContent = 'ПОДРОБНЕЕ О ПРОГРАММЕ';
    }
}

function toggleFAQ(button) {
    button.classList.toggle('active');
    const answer = button.nextElementSibling;
}

// Handle Buy button clicks (from onclick)
function handleBuy(tariffId) {
    const modal = document.getElementById('confirmation-modal');
    const proceedBtn = document.getElementById('modal-proceed');
    const checkbox = document.getElementById('agree-checkbox');

    // Payment links mapping
    const paymentLinks = {
        // TODO: вставить ссылки на оплату новых тарифов
        // «Питание» — 2 990 р.
        'lot1-rf': '',
        'lot1-norf': '',
        // «Питание + Тренировки» — 3 990 р.
        'lot2-rf': '',
        'lot2-norf': '',
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
