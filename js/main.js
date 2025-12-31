import { translations } from './data.js';

// Lucide Icons are loaded globally via script tag

const STORAGE_KEY = 'myuppy_lang';
let currentLang = localStorage.getItem(STORAGE_KEY) || 'ru';

// DOM Elements
// Chat elements removed per request

// --- Language Logic ---
function updateLanguage(lang) {
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    // Update standard text elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });

    // Update Nav Buttons Styles
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.dataset.lang === lang) {
            btn.classList.add('bg-purple-600', 'text-white');
            btn.classList.remove('text-gray-500', 'hover:text-white');
        } else {
            btn.classList.remove('bg-purple-600', 'text-white');
            btn.classList.add('text-gray-500', 'hover:text-white');
        }
    });
}

// --- Navigation Logic ---
function initNavigation() {
    const menuBtn = document.getElementById('menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('hidden');
        });
    }

    if (closeMenuBtn && mobileMenu) {
        closeMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
                mobileMenu.classList.add('hidden');
            }
        }
    });

    // Header scroll effect
    const nav = document.querySelector('nav');
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                nav.classList.add('glass', 'py-4', 'shadow-lg');
                nav.classList.remove('bg-transparent', 'py-6');
            } else {
                nav.classList.remove('glass', 'py-4', 'shadow-lg');
                nav.classList.add('bg-transparent', 'py-6');
            }
        });
    }

    // Language Buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lang = e.target.dataset.lang;
            updateLanguage(lang);
        });
    });
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    updateLanguage(currentLang);

    if (window.lucide) window.lucide.createIcons();
});

// Watch for Lucide load if deferred
window.addEventListener('load', () => {
    if (window.lucide) window.lucide.createIcons();
});
