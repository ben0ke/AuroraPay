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

    /* script.js - CustomNavbar render része */

    render() {
        const user = AuthService.getUser();
        // Név logika...
        const displayName = user && user.name ? user.name.split(' ')[0] : (user ? user.email.split('@')[0] : '');

        this.innerHTML = `
            <nav class="bg-gray-900/90 backdrop-blur-md border-b border-gray-800 fixed w-full z-50 top-0 transition-all duration-300">
                <div class="container mx-auto px-4 py-3 flex justify-between items-center">
                    </div>
            </nav>
            `;
        if(typeof feather !== 'undefined') feather.replace();
    }
    }
}
if (!customElements.get('custom-navbar')) customElements.define('custom-navbar', CustomNavbar);

// 4. FOOTER
class CustomFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer class="bg-gray-900 border-t border-gray-800 py-8 mt-auto">
                <div class="container
