/* script.js - A fejlett verzió Névvel és Számlaadatokkal */

// 1. SEGÉDFÜGGVÉNY: Véletlen számlaszám generátor
function generateIBAN() {
    const bankCode = '117'; // Minta bankazonosító
    const branch = Math.floor(1000 + Math.random() * 9000); // 4 számjegy
    const account = Math.floor(10000000 + Math.random() * 90000000); // 8 számjegy
    // Formátum: HU42 117X-XXXX-XXXXXXXX
    return `HU42 ${bankCode}7-${branch}-${account}`;
}

// 2. AUTH SERVICE
const AuthService = {
    login: (userData) => {
        // Ha nincs még számlaszáma (új regisztráció), generálunk neki
        if (!userData.iban) {
            userData.iban = generateIBAN();
            userData.swift = 'AUROHUHB'; // AuroraPay Hungary Budapest kód
            userData.balance = 271000; // Kezdő egyenleg (demo)
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

// 3. NAVBAR KOMPONENS
class CustomNavbar extends HTMLElement {
    connectedCallback() {
        this.render();
        window.addEventListener('auth-change', () => this.render());
        
        // Aktív link jelölése
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
        // A név megjelenítése, ha van, különben az email eleje
        const displayName = user && user.name ? user.name.split(' ')[0] : (user ? user.email.split('@')[0] : '');

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
                                    <i data-feather="user" class="w-5 h-5"></i>
                                </a>
                                <button onclick="AuthService.logout()" class="text-red-400 hover:text-red-300 transition" title="Kilépés">
                                    <i data-feather="log-out" class="w-5 h-5"></i>
                                </button>
                            </div>
                        ` : `
                            <a href="login.html" class="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white px-5 py-2 rounded-full text-sm font-bold transition ml-4 flex items-center gap-2 shadow-lg shadow-primary-900/20">
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

// 4. FOOTER
class CustomFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer class="bg-gray-900 border-t border-gray-800 py-8 mt-auto">
                <div class="container
