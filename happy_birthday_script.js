
// =====================================================
//  CONFETTI CANVAS ANIMATION
// =====================================================
function initConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const COLORS = [
        '#E2C750', '#f9e87a',   // gold
        '#B8A1CF', '#d9c3f4',   // lavender
        '#78913D', '#a8d08d',   // olive/green
        '#fff',                 // white
        '#ff9ecd',              // pink accent
    ];

    class Particle {
        constructor() { this.reset(true); }

        reset(initial) {
            this.x     = Math.random() * canvas.width;
            this.y     = initial ? Math.random() * canvas.height * 0.5 - canvas.height * 0.5 : -20;
            this.size  = Math.random() * 8 + 3;
            this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
            this.speedY = Math.random() * 1.4 + 0.4;
            this.speedX = (Math.random() - 0.5) * 1.2;
            this.rotation = Math.random() * 360;
            this.spin  = (Math.random() - 0.5) * 3;
            this.shape = Math.random() < 0.5 ? 'rect' : 'circle';
            this.opacity = Math.random() * 0.6 + 0.3;
            this.wobble = Math.random() * Math.PI * 2;
            this.wobbleSpeed = Math.random() * 0.04 + 0.01;
        }

        update() {
            this.y += this.speedY;
            this.wobble += this.wobbleSpeed;
            this.x += this.speedX + Math.sin(this.wobble) * 0.6;
            this.rotation += this.spin;
            if (this.y > canvas.height + 20) this.reset(false);
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            if (this.shape === 'rect') {
                ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    const particles = Array.from({ length: 70 }, () => new Particle());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    animate();
}


// =====================================================
//  DAILY SEAT COUNTDOWN
//  Subtracts 2-3 random seats per lot per day
//  Stored in localStorage so it persists between visits
// =====================================================
function initSeatCountdown() {
    const LOT1_START = 96;
    const LOT2_START = 89;
    const MIN_SEATS  = 3; // Never drop below this

    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

    // Load stored values
    let lot1 = parseInt(localStorage.getItem('hb_lot1_seats'), 10);
    let lot2 = parseInt(localStorage.getItem('hb_lot2_seats'), 10);
    let lastDate = localStorage.getItem('hb_last_date') || '';

    // First visit ever — set starting values
    if (isNaN(lot1)) lot1 = LOT1_START;
    if (isNaN(lot2)) lot2 = LOT2_START;

    // New day — subtract random 2-3 from each lot
    if (lastDate !== today) {
        const subtract1 = Math.floor(Math.random() * 2) + 2; // 2 or 3
        const subtract2 = Math.floor(Math.random() * 2) + 2;
        lot1 = Math.max(MIN_SEATS, lot1 - subtract1);
        lot2 = Math.max(MIN_SEATS, lot2 - subtract2);
        localStorage.setItem('hb_lot1_seats', lot1);
        localStorage.setItem('hb_lot2_seats', lot2);
        localStorage.setItem('hb_last_date', today);
    }

    // Update DOM
    const el1 = document.getElementById('lot1-seats');
    const el2 = document.getElementById('lot2-seats');
    if (el1) el1.textContent = lot1;
    if (el2) el2.textContent = lot2;

    // Pulse animation on low stock
    if (lot1 <= 10) {
        const badge1 = document.getElementById('lot1-badge');
        if (badge1) badge1.classList.add('badge-urgent');
    }
    if (lot2 <= 10) {
        const badge2 = document.getElementById('lot2-badge');
        if (badge2) badge2.classList.add('badge-urgent');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initSeatCountdown();
    initConfetti();

    // Cherry Blossom Petals Effect
    const canvas = document.getElementById('petals-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const petals = [];
        const maxPetals = 35;
        const petalColors = [
            'rgba(247, 197, 160, ',  // peach
            'rgba(212, 96, 122,  ',  // rose
            'rgba(200, 155, 94,  ',  // gold
            'rgba(255, 218, 185, ',  // moccasin
            'rgba(109, 175, 122, ',  // spring green
        ];

        class Petal {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height - height;
                this.size = Math.random() * 12 + 6;
                this.speedY = Math.random() * 0.8 + 0.3;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.opacity = Math.random() * 0.4 + 0.3;
                this.rotation = Math.random() * 360;
                this.spin = (Math.random() - 0.5) * 1.5;
                this.wobble = Math.random() * Math.PI * 2;
                this.wobbleSpeed = Math.random() * 0.02 + 0.01;
                this.color = petalColors[Math.floor(Math.random() * petalColors.length)];
            }

            update() {
                this.y += this.speedY;
                this.wobble += this.wobbleSpeed;
                this.x += this.speedX + Math.sin(this.wobble) * 0.5;
                this.rotation += this.spin;
                if (this.y > height + 20) {
                    this.y = -20;
                    this.x = Math.random() * width;
                }
                if (this.x > width + 20) this.x = -20;
                if (this.x < -20) this.x = width + 20;
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation * Math.PI / 180);
                ctx.fillStyle = this.color + this.opacity + ')';

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(
                    this.size / 2, -this.size / 2,
                    this.size, 0,
                    0, this.size
                );
                ctx.bezierCurveTo(
                    -this.size, 0,
                    -this.size / 2, -this.size / 2,
                    0, 0
                );
                ctx.fill();
                ctx.restore();
            }
        }

        for (let i = 0; i < maxPetals; i++) {
            petals.push(new Petal());
        }

        function animatePetals() {
            ctx.clearRect(0, 0, width, height);
            petals.forEach(petal => {
                petal.update();
                petal.draw();
            });
            requestAnimationFrame(animatePetals);
        }

        animatePetals();

        window.addEventListener('resize', () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        });
    }


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

    // Smooth Scroll Reveal Animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.lot-card, .benefit-card, .review-card, .faq-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
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
    const answer = button.nextElementSibling;
    const isOpen = button.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq-question.open').forEach(q => {
        q.classList.remove('open');
        q.nextElementSibling.classList.remove('open');
    });
    if (!isOpen) {
        button.classList.add('open');
        answer.classList.add('open');
    }
}

// Handle Buy button clicks (from onclick)
function handleBuy(tariffId) {
    const modal = document.getElementById('confirmation-modal');
    const proceedBtn = document.getElementById('modal-proceed');
    const checkbox = document.getElementById('agree-checkbox');

    // Payment links mapping
    const paymentLinks = {
        'lot1-rf':   'https://payform.ru/m4bOI82/',
        'lot1-norf': 'https://app.lava.top/products/51f5cfa9-53c3-4d9a-b108-cd07cbd7ef43',
        'lot2-rf':   'https://payform.ru/dfbOIjy/',
        'lot2-norf': 'https://app.lava.top/products/22ec0d36-edc1-4381-9b7c-abc350e57f9e',
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
