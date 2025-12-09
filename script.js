/* script.js - Frissített verzió */

// 1. AUTH SERVICE (Változatlan)
const AuthService = {
    login: (userData) => {
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

// 2. NAVBAR (Módosítva: Link a login.html-re)
class CustomNavbar extends HTMLElement {
    connectedCallback() {
        this.render();
        window.addEventListener('auth-change', () => this.render());
        
        // Aktív oldal jelzése
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
        
        this.innerHTML = `
            <nav class="bg-gray-800/90 backdrop-blur-md border-b border-gray-700 fixed w-full z-50 top-0 transition-all duration-300">
                <div class="container mx-auto px-4 py-3 flex justify-between items-center">
                    <a href="index.html" class="flex items-center gap-2 font-bold text-xl text-white">
                        <img src="https://huggingface.co/spaces/ben0ke/aurorapay-p-nzvar-zsl-k-fiataloknak/resolve/main/images/auroralogo.png" class="h-8" alt="Logo">
                        AuroraPay
                    </a>
                    
                    <div class="hidden md:flex gap-6 items-center">
                        <a href="features.html" class="text-gray-300 hover:text-white transition font-medium">Funkciók</a>
                        <a href="learn.html" class="text-gray-300 hover:text-white transition font-medium">Tudástár</a>
                        
                        ${user ? `
                            <div class="flex items-center gap-4 ml-4">
                                <span class="text-primary-400 text-sm hidden lg:inline">Szia, ${user.email.split('@')[0]}!</span>
                                <a href="dashboard.html" class="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-full text-sm font-bold transition shadow-lg shadow-primary-900/20">
                                    Fiókom
                                </a>
                                <button onclick="AuthService.logout()" class="text-gray-400 hover:text-red-400 transition" title="Kilépés">
                                    <i data-feather="log-out" class="w-5 h-5"></i>
                                </button>
                            </div>
                        ` : `
                            <a href="login.html" class="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-full text-sm font-bold transition ml-4 flex items-center gap-2">
                                <i data-feather="user"></i> Belépés
                            </a>
                        `}
                    </div>
                    
                    <button class="md:hidden text-gray-300">
                        <i data-feather="menu"></i>
                    </button>
                </div>
            </nav>
            <div class="h-20"></div>
        `;
        if(typeof feather !== 'undefined') feather.replace();
    }
}
if (!customElements.get('custom-navbar')) customElements.define('custom-navbar', CustomNavbar);

// 3. FOOTER (Változatlan)
class CustomFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer class="bg-gray-900 border-t border-gray-800 py-8 mt-auto">
                <div class="container mx-auto px-4 text-center text-gray-400">
                    <p>&copy; ${new Date().getFullYear()} AuroraPay. Minden jog fenntartva.</p>
                </div>
            </footer>
        `;
    }
}
if (!customElements.get('custom-footer')) customElements.define('custom-footer', CustomFooter);

// 4. LOGIN OLDAL LOGIKA
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    
    if (signupForm) {
        // Ha a login.html-en vagyunk
        const currentUser = AuthService.getUser();
        
        if (currentUser) {
            // Ha már be van lépve, cseréljük le az egész űrlap konténert
            const container = document.getElementById('loginContainer');
            if(container) {
                container.innerHTML = `
                    <div class="text-center py-4">
                        <div class="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i data-feather="check" class="text-green-500 w-8 h-8"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-white mb-2">Már be vagy jelentkezve!</h3>
                        <p class="text-gray-300 mb-6">${currentUser.email}</p>
                        <a href="dashboard.html" class="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-full transition inline-block w-full">
                            Irány a Vezérlőpult
                        </a>
                        <button onclick="AuthService.logout()" class="mt-4 text-gray-500 hover:text-white text-sm">
                            Kijelentkezés és új belépés
                        </button>
                    </div>
                `;
                if(typeof feather !== 'undefined') feather.replace();
            }
        } else {
            // Belépés kezelése
            signupForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const submitBtn = document.getElementById('submitSignup');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i data-feather="loader" class="animate-spin"></i> Ellenőrzés...';
                if(typeof feather !== 'undefined') feather.replace();
                
                const email = document.getElementById('email').value;
                const age = document.getElementById('age').value;
                
                setTimeout(() => {
                    const userData = {
                        email: email,
                        age: age,
                        joinedAt: new Date().toISOString()
                    };
                    
                    AuthService.login(userData);
                    window.location.href = 'dashboard.html'; // Azonnali átirányítás
                    
                }, 1000);
            });
        }
    }
});
