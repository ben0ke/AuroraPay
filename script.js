/* script.js - HIBAJAVÍTOTT, BIZTOS VERZIÓ */

// 1. SEGÉDFÜGGVÉNY: Számla generálás
function generateIBAN() {
    const bankCode = '117'; 
    const branch = Math.floor(1000 + Math.random() * 9000); 
    const account = Math.floor(10000000 + Math.random() * 90000000); 
    return `HU42 ${bankCode}7-${branch}-${account}`;
}

// 2. AUTH SERVICE
const AuthService = {
    login: function(userData) {
        if (!userData.iban) {
            userData.iban = generateIBAN();
            userData.swift = 'AUROHUHB';
            userData.balance = 142500;
        }
        localStorage.setItem('aurorapay_current_user', JSON.stringify(userData));
        window.dispatchEvent(new Event('auth-change'));
    },
    getUser: function() {
        const data = localStorage.getItem('aurorapay_current_user');
        return data ? JSON.parse(data) : null;
    },
    logout: function() {
        localStorage.removeItem('aurorapay_current_user');
        window.location.href = 'index.html';
    }
};

// 3. NAVBAR KOMPONENS
// Külön változóba tesszük a HTML-t a hiba elkerülése végett
class CustomNavbar extends HTMLElement {
    connectedCallback() {
        this.render();
        window.addEventListener('auth-change', () => this.render());
        this.highlightActiveLink();
    }

    highlightActiveLink() {
        setTimeout(() => {
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            const links = this.querySelectorAll('nav a');
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (href && (href === currentPage || (currentPage === 'index.html' && href.startsWith('index.html')))) {
                    link.classList.add('text-white');
                    link.classList.remove('text-gray-300');
                }
            });
        }, 100);
    }

    render() {
        const user = AuthService.getUser();
        let displayName = '';
        if (user) {
            displayName = user.name ? user.name.split(' ')[0] : user.email.split('@')[0];
        }

        // Itt építjük fel a menü jobb oldalát, hogy ne legyen szintaktikai hiba
        let rightMenuHtml = '';
        
        if (user) {
            // HA BE VAN LÉPVE
            rightMenuHtml = `
                <div class="flex items-center gap-4 ml-4 pl-4 border-l border-gray-700">
                    <div class="text-right hidden lg:block">
                        <span class="block text-white text-sm font-bold leading-tight">${displayName}</span>
                        <span class="block text-gray-500 text-xs">Prémium fiók</span>
                    </div>
                    <a href="dashboard.html" class="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white p-2 rounded-full transition">
                        <i data-feather="user" class="w-5 h-5"></i>
                    </a>
                    <button onclick="AuthService.logout()" class="text-red-400 hover:text-red-300 transition" title="Kilépés">
                        <i data-feather="log-out" class="w-5 h-5"></i>
                    </button>
                </div>
            `;
        } else {
            // HA NINCS BELÉPVE
            rightMenuHtml = `
                <a href="login.html" class="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white px-5 py-2 rounded-full text-sm font-bold transition ml-4 flex items-center gap-2 shadow-lg shadow-primary-900/20">
                    <i data-feather="user" class="w-4 h-4"></i> 
                    Belépés
                </a>
            `;
        }

        // A teljes Navbar HTML
        this.innerHTML = `
            <nav class="bg-gray-900/90 backdrop-blur-md border-b border-gray-800 fixed w-full z-50 top-0 transition-all duration-300">
                <div class="container mx-auto px-4 py-3 flex justify-between items-center">
                    <a href="index.html" class="flex items-center gap-2 font-bold text-xl text-white">
                        <img src="https://huggingface.co/spaces/ben0ke/aurorapay-p-nzvar-zsl-k-fiataloknak/resolve/main/images/auroralogo.png" class="h-8" alt="Logo">
                        AuroraPay
                    </a>
                    
                    <div class="hidden md:flex gap-6 items-center">
                        <a href="features.html" class="text-gray-300 hover:text-white transition font-medium">Funkciók</a>
                        <a href="learn.html" class="text-gray-300 hover:text-white transition font-medium">Tudástár</a>
                        ${rightMenuHtml}
                    </div>
                    
                    <button class="md:hidden text-gray-300">
                        <i data-feather="menu"></i>
                    </button>
                </div>
            </nav>
        `;

        if(typeof feather !== 'undefined') feather.replace();
    }
}

// Ellenőrizzük, hogy létezik-e már a komponens
if (!customElements.get('custom-navbar')) {
    customElements.define('custom-navbar', CustomNavbar);
}

// 4. FOOTER KOMPONENS
class CustomFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer class="bg-gray-900 border-t border-gray-800 py-8 mt-auto">
                <div class="container mx-auto px-4 text-center text-gray-400">
                    <p>&copy; ${new Date().getFullYear()} AuroraPay Zrt. Minden jog fenntartva.</p>
                </div>
            </footer>
        `;
    }
}
if (!customElements.get('custom-footer')) {
    customElements.define('custom-footer', CustomFooter);
}

// 5. REGISZTRÁCIÓ KEZELÉSE
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    
    // Ha van űrlap az oldalon (login.html)
    if (signupForm) {
        const currentUser = AuthService.getUser();
        
        // Ha már be van lépve, ne engedjük újra regisztrálni
        if (currentUser) {
            // De csak akkor irányítsunk át, ha nem a dashboardon vagyunk
            if (!window.location.pathname.includes('dashboard.html')) {
                window.location.href = 'dashboard.html';
            }
        } else {
            // Regisztráció eseménykezelő
            signupForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const submitBtn = document.getElementById('submitSignup');
                if(submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = 'Feldolgozás...';
                }
                
                // Adatok kinyerése biztonságosan
                const nameInput = document.getElementById('fullname');
                const name = nameInput ? nameInput.value : 'Felhasználó';
                
                const emailInput = document.getElementById('email');
                const email = emailInput ? emailInput.value : '';
                
                const ageInput = document.getElementById('age');
                const age = ageInput ? ageInput.value : '18';
                
                setTimeout(() => {
                    const userData = {
                        name: name,
                        email: email,
                        age: age,
                        joinedAt: new Date().toISOString()
                    };
                    
                    AuthService.login(userData);
                    window.location.href = 'dashboard.html';
                }, 800);
            });
        }
    }
});
