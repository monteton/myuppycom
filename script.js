document.addEventListener('DOMContentLoaded', () => {
    // Snow Effect
    const canvas = document.createElement('canvas');
    canvas.id = 'snow-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const flakes = [];
    const maxFlakes = 50; // Reduced density

    class Flake {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 8 + 8; // Size 8px to 16px to be visible as flakes
            this.speed = Math.random() * 0.5 + 0.25;
            this.opacity = Math.random() * 0.3 + 0.6; // High opacity (0.6-0.9) to shine through overlay
            this.rotation = Math.random() * 360;
            this.spin = (Math.random() - 0.5) * 2; // Random spin direction and speed
        }

        update() {
            this.y += this.speed;
            this.rotation += this.spin;
            if (this.y > height) {
                this.y = -20;
                this.x = Math.random() * width;
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.font = `${this.size}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('❄', 0, 0);
            ctx.restore();
        }
    }

    for (let i = 0; i < maxFlakes; i++) {
        flakes.push(new Flake());
    }

    function animateSnow() {
        ctx.clearRect(0, 0, width, height);
        flakes.forEach(flake => {
            flake.update();
            flake.draw();
        });
        requestAnimationFrame(animateSnow);
    }

    animateSnow();

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
    let currentLink = null; // To store the link of the clicked button

    // Open modal on Buy button click
    document.querySelectorAll('.btn-buy').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            currentLink = btn.dataset.link;
            modal.classList.remove('hidden');
        });
    });

    // Close modal function
    function closeModal() {
        modal.classList.add('hidden');
        checkbox.checked = false;
        proceedBtn.disabled = true;
    }

    // Close on X click
    closeX.addEventListener('click', closeModal);

    // Checkbox toggle
    checkbox.addEventListener('change', () => {
        proceedBtn.disabled = !checkbox.checked;
    });

    // Proceed action
    proceedBtn.addEventListener('click', () => {
        if (checkbox.checked) {
            if (currentLink) {
                window.location.href = currentLink;
            } else {
                alert('Переход к оплате (Link not set)...');
            }
            closeModal();
        }
    });

    // Close on click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
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
        docContent.innerHTML = '<div style="text-align:center; padding: 2rem;">Загрузка...</div>';

        fetch(fileUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(html => {
                // Strip <html>, <head>, <body> tags to inject into div cleanly if possible, 
                // but browsers handle innerHTML with full docs reasonably well (ignoring outer tags).
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
