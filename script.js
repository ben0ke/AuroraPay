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
        // Figyeljük, ha valaki be/kilép, hogy frissüljön a menü
        window.addEventListener('auth-change', () => this.render());
    }

    render() {
        const user = AuthService.getUser();
        
        this.innerHTML = `
            <nav class="bg-gray-800/50 backdrop-blur-md border-b border-gray-700 fixed w-full z-50 top-0">
                <div class="container mx-auto px-4 py-3 flex justify-between items-center">
                    <a href="index.html" class="flex items-center gap-2 font-bold text-xl text-white">
                        <img src="https://huggingface.co/spaces/ben0ke/aurorapay-p-nzvar-zsl-k-fiataloknak/resolve/main/images/auroralogo.png" class="h-8" alt="Logo">
                        AuroraPay
                    </a>
                    
                    <div class="hidden md:flex gap-6 items-center">
                        <a href="index.html#features" class="text-gray-300 hover:text-white transition">Funkciók</a>
                        <a href="index.html#learn" class="text-gray-300 hover:text-white transition">Tudástár</a>
                        
                        ${user ? `
                            <div class="flex items-center gap-4">
                                <span class="text-primary-400 text-sm">Szia, ${user.email.split('@')[0]}!</span>
                                <button onclick="AuthService.logout()" class="text-gray-300 hover:text-red-400 transition flex items-center gap-1">
                                    <i data-feather="log-out" class="w-4 h-4"></i> Kilépés
                                </button>
                                <a href="dashboard.html" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-full text-sm font-bold transition">
                                    Fiókom
                                </a>
                            </div>
                        ` : `
                            <a href="index.html#signup" class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full text-sm font-bold transition">
                                Belépés / Regisztráció
                            </a>
                        `}
                    </div>
                </div>
            </nav>
            <div class="h-16"></div> `;
        
        // Ikonok újratöltése a beillesztés után
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
