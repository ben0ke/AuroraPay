/* script.js - A teljes, javított verzió */

// 1. AUTH SERVICE - Az adatok kezelése
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
        window.location.href = 'index.html'; // Kilépéskor visszavisz a főoldalra
    }
};

// 2. NAVBAR KOMPONENS
class CustomNavbar extends HTMLElement {
    connectedCallback() {
        this.render();
        window.addEventListener('auth-change', () => this.render());
        
        // Aktív oldal jelzése a menüben
        setTimeout(() => {
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            const links = this.querySelectorAll('nav a');
            links.forEach(link => {
                // Pontos egyezés vagy ha üres (főoldal)
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
                            <a href="index.html#signup" class="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-full text-sm font-bold transition ml-4">
                                Belépés
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

if (!customElements.get('custom-navbar')) {
    customElements.define('custom-navbar', CustomNavbar);
}

// 3. FOOTER KOMPONENS
class CustomFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer class="bg-gray-900 border-t border-gray-800 py-8 mt-auto">
                <div class="container mx-auto px-4 text-center text-gray-400">
                    <div class="flex justify-center gap-6 mb-4">
                        <a href="#" class="hover:text-primary-400"><i data-feather="facebook"></i></a>
                        <a href="#" class="hover:text-primary-400"><i data-feather="instagram"></i></a>
                        <a href="#" class="hover:text-primary-400"><i data-feather="twitter"></i></a>
                    </div>
                    <p>&copy; ${new Date().getFullYear()} AuroraPay. Minden jog fenntartva.</p>
                </div>
            </footer>
        `;
        if(typeof feather !== 'undefined') feather.replace();
    }
}

if (!customElements.get('custom-footer')) {
    customElements.define('custom-footer', CustomFooter);
}

// 4. REGISZTRÁCIÓ KEZELÉSE (Ez hiányzott!)
// Megvárjuk, amíg az oldal betölt
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    
    // Csak akkor fut le, ha megtalálja a formot (tehát az index.html-en vagyunk)
    if (signupForm) {
        
        // Ellenőrzés: ha már be van lépve, ne mutassuk a formot
        const currentUser = AuthService.getUser();
        if (currentUser) {
            const signupSection = document.getElementById('signup');
            if(signupSection) {
                signupSection.innerHTML = `
                    <div class="text-center py-12 bg-gray-800/50 rounded-2xl border border-gray-700">
                        <div class="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i data-feather="check" class="text-green-500 w-8 h-8"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-white mb-2">Már be vagy jelentkezve!</h3>
                        <p class="text-gray-300 mb-6">Fiók: ${currentUser.email}</p>
                        <a href="dashboard.html" class="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-full transition">
                            Tovább a Vezérlőpultra
                        </a>
                    </div>
                `;
                if(typeof feather !== 'undefined') feather.replace();
            }
        } else {
            // Ha nincs belépve, figyeljük a gombnyomást
            signupForm.addEventListener('submit', function(e) {
                e.preventDefault(); // Ne töltődjön újra az oldal hagyományosan
                
                const submitBtn = document.getElementById('submitSignup');
                const originalContent = submitBtn.innerHTML;
                
                // 1. Loading állapot
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i data-feather="loader" class="animate-spin"></i> Feldolgozás...';
                if(typeof feather !== 'undefined') feather.replace();
                
                // 2. Adatok kinyerése
                const email = document.getElementById('email').value;
                const age = document.getElementById('age').value;
                
                // 3. Mesterséges késleltetés (hogy látszódjon a töltés)
                setTimeout(() => {
                    const userData = {
                        email: email,
                        age: age,
                        joinedAt: new Date().toISOString()
                    };
                    
                    // 4. Mentés
                    AuthService.login(userData);
                    
                    alert('Sikeres regisztráció! Üdvözlünk az AuroraPay-en.');
                    
                    // 5. Átirányítás a vezérlőpultra
                    window.location.href = 'dashboard.html';
                    
                }, 1500);
            });
        }
    }
});
