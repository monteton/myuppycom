document.addEventListener('DOMContentLoaded', () => {
    // Cherry Blossom Petals Effect
    const canvas = document.getElementById('petals-canvas');
    if (!canvas) return;
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

            // Draw petal shape
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
        'test-drive-rf': 'https://payform.ru/nraPzOW/',
        'test-drive-norf': 'https://app.lava.top/products/51f5cfa9-53c3-4d9a-b108-cd07cbd7ef43',
        'lot2-rf': 'https://payform.ru/cd9Ktdf/',
        'lot2-norf': 'https://app.lava.top/products/522ec7f4-a7c0-44ad-8cbd-f43598484f1e',
        'lot3-rf': 'https://payform.ru/4ha6rM0/',
        'lot3-norf': 'https://app.lava.top/products/e32e67fb-4544-430c-9f1b-0e274c18783f',
        'lot4-rf': 'https://payform.ru/scaPzRm/',
        'lot4-norf': 'https://app.lava.top/products/a9f6ffda-b944-4509-9914-f2b11c490bd3',
        'lot5-rf': 'https://payform.ru/b1a6rQo/',
        'lot5-norf': 'https://app.lava.top/products/1f93f1c1-4e49-4a04-9ff8-d18c493c3c25',
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
