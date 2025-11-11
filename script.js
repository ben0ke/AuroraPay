// AuroraPay main script.js - cleaned up & corrected

// --- Apply Theme from LocalStorage Immediately (before DOMContentLoaded) ---
(function() {
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const currentTheme = localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');
    if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
})();

// --- DOMContentLoaded: Initialize all components ---
document.addEventListener('DOMContentLoaded', function() {
    initAllCharts();
    initDarkModeToggle();
    updateActiveNavLink();
    initForms();
    initAnimations();
    initTooltips();
    initSmoothScrolling();
    initMobileMenu();
    feather.replace();
    trackPageView();
});

// --- Chart Initialization (Financial Literacy Example) ---
function initFinancialLiteracyChart() {
    const ctx = document.getElementById('financialLiteracyChart');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['18-24 év', '25-29 év', '30-34 év', '35-44 év', '45+ év'],
            datasets: [{
                label: 'Pénzügyi tudatosság szintje (%)',
                data: [32, 45, 58, 67, 72],
                backgroundColor: [
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(124, 58, 237, 0.7)',
                    'rgba(109, 40, 217, 0.7)',
                    'rgba(91, 33, 182, 0.7)',
                    'rgba(76, 29, 149, 0.7)'
                ],
                borderColor: [
                    'rgba(139, 92, 246, 1)',
                    'rgba(124, 58, 237, 1)',
                    'rgba(109, 40, 217, 1)',
                    'rgba(91, 33, 182, 1)',
                    'rgba(76, 29, 149, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#e2e8f0',
                        font: { size: 14 }
                    }
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#e2e8f0',
                    bodyColor: '#cbd5e1',
                    borderColor: '#475569',
                    borderWidth: 1,
                    padding: 12
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { color: '#e2e8f0' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                x: {
                    ticks: { color: '#e2e8f0' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                }
            }
        }
    });
}

// --- Initialize All Charts ---
function initAllCharts() {
    initFinancialLiteracyChart();
    // Add other chart initializations here if needed
}

// --- Form Validation ---
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('error');
                    isValid = false;
                } else {
                    field.classList.remove('error');
                }
            });
            if (!isValid) {
                e.preventDefault();
                alert('Kérjük töltsd ki az összes kötelező mezőt!');
            }
        });
    });
}

// --- Mobile Menu Toggle ---
function initMobileMenu() {
    const menuButtons = document.querySelectorAll('[data-menu-toggle]');
    menuButtons.forEach(button => {
        button.addEventListener('click', () => {
            const menuId = button.getAttribute('data-menu-toggle');
            const menu = document.getElementById(menuId);
            if (menu) menu.classList.toggle('hidden');
        });
    });
}

// --- Tooltips ---
function initTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach(el => {
        const tooltipContent = el.getAttribute('data-tooltip');
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip hidden absolute bg-gray-800 text-white px-3 py-2 rounded text-sm shadow-lg z-50';
        tooltip.textContent = tooltipContent;
        document.body.appendChild(tooltip);

        el.addEventListener('mouseenter', () => {
            const rect = el.getBoundingClientRect();
            tooltip.style.left = `${rect.left + rect.width/2 - tooltip.offsetWidth/2}px`;
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
            tooltip.classList.remove('hidden');
        });

        el.addEventListener('mouseleave', () => {
            tooltip.classList.add('hidden');
        });
    });
}

// --- Smooth Scrolling for Anchor Links ---
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// --- Active Nav Link ---
function updateActiveNavLink() {
    const currentPath = window.location.pathname;
    const navbars = document.querySelectorAll('custom-navbar');
    navbars.forEach(navbar => {
        const shadow = navbar.shadowRoot;
        if (!shadow) return;
        const updateLinks = (links) => {
            links.forEach(link => {
                link.classList.remove('active');
                const linkPath = new URL(link.href).pathname;
                if (
                    linkPath.endsWith(currentPath) ||
                    (currentPath === '/index.html' && linkPath.endsWith('index.html')) ||
                    (currentPath === '/' && linkPath.endsWith('index.html'))
                ) {
                    link.classList.add('active');
                }
            });
        };
        updateLinks(shadow.querySelectorAll('.nav-links a'));
        updateLinks(shadow.querySelectorAll('.mobile-menu a'));
    });
}

// --- Forms ---
function initForms() {
    // Signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const submitBtn = document.getElementById('submitSignup');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i data-feather="loader" class="animate-spin"></i> Regisztráció folyamatban...';
            feather.replace();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const age = document.getElementById('age').value;
            if (!email || !password || !age) {
                alert('Kérjük töltsd ki az összes mezőt!');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i data-feather="user-plus"></i> Regisztrálok';
                feather.replace();
                return;
            }
            setTimeout(() => {
                const userData = { email, age, joinedAt: new Date().toISOString() };
                localStorage.setItem('aurorapay_user_' + email, JSON.stringify(userData));
                alert('Sikeres regisztráció! Köszönjük, hogy csatlakoztál az AuroraPay közösségéhez.');
                signupForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i data-feather="user-plus"></i> Regisztrálok';
                feather.replace();
            }, 1500);
        });
    }

    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const submitBtn = document.getElementById('submitContact');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i data-feather="loader" class="animate-spin"></i> Küldés folyamatban...';
            feather.replace();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            if (!name || !email || !message) {
                alert('Kérjük töltsd ki az összes mezőt!');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i data-feather="send"></i> Üzenet küldése';
                feather.replace();
                return;
            }
            setTimeout(() => {
                const contactData = { name, email, message, sentAt: new Date().toISOString() };
                localStorage.setItem('aurorapay_contact_' + Date.now(), JSON.stringify(contactData));
                alert('Köszönjük üzeneted! Hamarosan válaszolunk.');
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i data-feather="send"></i> Üzenet küldése';
                feather.replace();
            }, 1500);
        });
    }
}

// --- Animations (Scroll) ---
function initAnimations() {
    // Observe scroll-triggered animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-visible');
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.animate-fade-in').forEach(el => { observer.observe(el); });
    document.querySelectorAll('.animate-slide-in-left').forEach(el => { observer.observe(el); });
    document.querySelectorAll('.animate-slide-in-right').forEach(el => { observer.observe(el); });
    document.querySelectorAll('.animate-slide-in-up').forEach(el => { observer.observe(el); });
}

// --- Debounce Helper ---
function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// --- Redraw charts on window resize (debounced) ---
window.addEventListener('resize', debounce(function() {
    initAllCharts();
}, 250));

// --- Service Worker Registration for PWA ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful', registration);
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// --- Add to homescreen prompt ---
let deferredPrompt;
window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
    const installButton = document.getElementById('installButton');
    if (installButton) {
        installButton.style.display = 'block';
        installButton.addEventListener('click', function() {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(function(choiceResult) {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
                deferredPrompt = null;
            });
        }, { once: true });
    }
});

// --- Google Analytics Page View Tracking ---
function trackPageView() {
    if (typeof gtag !== 'undefined') {
        gtag('config', 'GA_MEASUREMENT_ID', {
            'page_path': window.location.pathname,
            'page_title': document.title
        });
    }
}

// --- Dark Mode Toggle ---
function initDarkModeToggle() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return;
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const currentTheme = localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');
    darkModeToggle.checked = currentTheme === 'dark';

    darkModeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    });
}

// --- END ---
