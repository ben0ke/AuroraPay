const AuthService = {
    // Felhasználó mentése (Regisztráció/Belépés)
    login: (userData) => {
        localStorage.setItem('aurorapay_current_user', JSON.stringify(userData));
        window.dispatchEvent(new Event('auth-change')); // Jelzünk az oldalnak, hogy változott a státusz
    },

    // Felhasználó lekérése
    getUser: () => {
        const data = localStorage.getItem('aurorapay_current_user');
        return data ? JSON.parse(data) : null;
    },

    // Kijelentkezés
    logout: () => {
        localStorage.removeItem('aurorapay_current_user');
        window.location.reload(); // Oldal újratöltése a frissítéshez
    }
};

// 2. KÖZÖS NAVIGÁCIÓS MENÜ (Web Component)
// Ez biztosítja, hogy minden aloldalon ugyanaz a menü legyen
class CustomNavbar extends HTMLElement {
    connectedCallback() {
        this.render();
        window.addEventListener('auth-change', () => this.render());
        
        // Aktív oldal megjelölése
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const links = this.querySelectorAll('nav a');
        links.forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('text-white');
                link.classList.remove('text-gray-300');
            }
        });
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

// 3. KOMPONENSEK REGISZTRÁLÁSA
// Ellenőrizzük, hogy létezik-e már, mielőtt definiáljuk
if (!customElements.get('custom-navbar')) {
    customElements.define('custom-navbar', CustomNavbar);
}

// Egyszerű Footer komponens
class CustomFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer class="bg-gray-900 border-t border-gray-800 py-8 mt-12">
                <div class="container mx-auto px-4 text-center text-gray-400">
                    <p>&copy; ${new Date().getFullYear()} AuroraPay. Minden jog fenntartva.</p>
                </div>
            </footer>
        `;
    }
}

if (!customElements.get('custom-footer')) {
    customElements.define('custom-footer', CustomFooter);
}

// Üres Header komponens (ha szükséges a layout miatt, de a navbar megoldja)
class CustomHeader extends HTMLElement { connectedCallback() { this.innerHTML = ''; } }
if (!customElements.get('custom-header')) { customElements.define('custom-header', CustomHeader); }
