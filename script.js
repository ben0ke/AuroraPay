/* script.js - A VÉGLEGES, JAVÍTOTT VERZIÓ */

// 1. SEGÉDFÜGGVÉNY: Véletlen számlaszám generátor
function generateIBAN() {
    const bankCode = '117'; 
    const branch = Math.floor(1000 + Math.random() * 9000); 
    const account = Math.floor(10000000 + Math.random() * 90000000); 
    return `HU42 ${bankCode}7-${branch}-${account}`;
}

// 2. AUTH SERVICE
const AuthService = {
    login: (userData) => {
        if (!userData.iban) {
            userData.iban = generateIBAN();
            userData.swift = 'AUROHUHB';
            userData.balance = 142500;
        }
        localStorage.setItem('aurorapay_current_user', JSON.stringify(userData));
        window.dispatchEvent(new Event('auth-change'));
    },
    getUser: () => {
        const data = localStorage.getItem('aurorapay_current_user');
        return data ? JSON.parse(data) : null;
    },
    logout: () => {
        localStorage.removeItem('aurorapay_current_user');
        window.location.href = 'index.html';
    }
};

// 3. NAVBAR KOMPONENS (Javított!)
class CustomNavbar extends HTMLElement {
    connectedCallback() {
        this.render();
        window.addEventListener('auth-change', () => this.render());
        
        // Aktív link jelölése (kis késleltetéssel, hogy biztosan betöltődjön)
        setTimeout(() => {
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            const links = this.querySelectorAll('nav a');
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (href === currentPage || (currentPage === 'index.html' && href.startsWith('index.html'))) {
                    link.classList.add('text-white');
                    link.classList.remove('text-gray-300');
                }
            });
        }, 100);
    }

    render() {
        const user = AuthService.getUser();
        const displayName = user && user.name ? user.name.split(' ')[0] : (user ? user.email.split('@')[0] : '');

        // ITT A LÉNYEG: A <nav> elem és a tartalom
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
                        
                        ${user ? `
                            <div class="flex items-center gap-4 ml-4 pl-4 border-l border-gray-700">
                                <div class="text-right hidden lg:block">
                                    <span class="block text-white text-sm font-bold leading-tight">${user.name || displayName}</span>
                                    <span class="block text-gray-500 text-xs">Prémium fiók</span>
                                </div>
                                <a href="dashboard.html" class="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white p-2 rounded-full transition">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                </a>
                                <button onclick="AuthService.logout()" class="text-red-400 hover:text-red-300 transition" title="Kilépés">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                </button>
                            </div>
                        ` : `
                            <a href="login.html" class="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white px-5 py-2 rounded-full text-sm font-bold transition ml-4 flex items-center gap-2 shadow-lg shadow-primary-900/20">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> 
                                Belépés
                            </a>
                        `}
                    </div>
                    
                    <button class="md:hidden text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                </div>
            </nav>
        `;
        // Ikonok újratöltése (biztonsági ellenőrzéssel)
        if(typeof feather !== 'undefined') feather.replace();
    }
}
// Komponens regisztrálása (ellenőrzéssel, hogy ne fusson hibára)
if (!customElements.get('custom-navbar')) {
    customElements.define('custom-navbar', CustomNavbar);
}

// 4. FOOTER
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

// 5. REGISZTRÁCIÓ LOGIKA
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    
    if (signupForm) {
        const currentUser = AuthService.getUser();
        
        if (currentUser) {
            // Ha a login oldalon vagyunk és már be van lépve
            if(document.getElementById('loginContainer')) {
                 window.location.href = 'dashboard.html';
            }
        } else {
            signupForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const submitBtn = document.getElementById('submitSignup');
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Fiók létrehozása...'; // Egyszerűsített loading text
                
                const name = document.getElementById('fullname') ? document.getElementById('fullname').value : '';
                const email = document.getElementById('email').value;
                const age = document.getElementById('age') ? document.getElementById('age').value : '18';
                
                setTimeout(() => {
                    const userData = {
                        name: name,
                        email: email,
                        age: age,
                        joinedAt: new Date().toISOString()
                    };
                    
                    AuthService.login(userData);
                    window.location.href = 'dashboard.html';
                }, 1000);
            });
        }
    }
});
