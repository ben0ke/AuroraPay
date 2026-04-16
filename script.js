/* =========================================================================
   AuroraPay - KÖZPONTI RENDSZERLOGIKA (Végleges, Hibajavított Verzió)
   Tartalmazza: 
   - Szimulált backend (LocalStorage)
   - Navigáció és Lábléc komponensek
   - UI extrák (Preloader, Cursor Glow, Értesítések)
   - Aurora AI Chatbot
   ========================================================================= */

// -------------------------------------------------------------------------
// 1. SEGÉDFÜGGVÉNYEK
// -------------------------------------------------------------------------

/**
 * Magyar forint formázó (pl. 1 500 000 Ft)
 */
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('hu-HU', { 
        style: 'currency', 
        currency: 'HUF', 
        maximumFractionDigits: 0 
    }).format(amount);
};

/**
 * Valósághű (demó) IBAN generátor
 */
function generateIBAN() {
    const bankCode = '117'; 
    const branch = Math.floor(1000 + Math.random() * 9000); 
    const account = Math.floor(10000000 + Math.random() * 90000000); 
    return `HU42 ${bankCode}7-${branch}-${account}`;
}


// -------------------------------------------------------------------------
// 2. AUTH & WALLET SERVICE (Adatkezelés)
// -------------------------------------------------------------------------
const AuthService = {
    /**
     * Felhasználó bejelentkeztetése vagy mentése
     */
    login: function(userData) {
        // Ha új a felhasználó, inicializáljuk az adatait
        if (!userData.iban) {
            userData.iban = generateIBAN();
            userData.swift = 'AUROHUHB';
            userData.balance = 18890420; // A kért fix kezdőegyenleg
            userData.transactions = [
                { date: '2024.03.20', partner: 'Netflix', cat: 'Szórakozás', amount: -4500, status: 'completed' },
                { date: '2024.03.18', partner: 'Diákmunka Kft', cat: 'Fizetés', amount: 85000, status: 'completed' }
            ];
        }
        localStorage.setItem('aurorapay_current_user', JSON.stringify(userData));
        window.dispatchEvent(new Event('auth-change'));
    },
    
    /**
     * Jelenlegi felhasználó lekérése
     */
    getUser: function() {
        const data = localStorage.getItem('aurorapay_current_user');
        return data ? JSON.parse(data) : null;
    },
    
    /**
     * Kijelentkezés
     */
    logout: function() {
        localStorage.removeItem('aurorapay_current_user');
        window.location.href = 'index.html';
    },

    /**
     * Új regisztráció kezelése
     */
    signup: function(name, email, age) {
        const user = {
            name: name,
            email: email,
            age: age,
            balance: 18890420,
            iban: generateIBAN(),
            swift: 'AUROHUHB',
            joined: new Date().toLocaleDateString('hu-HU'),
            transactions: [] // Kezdésnek üres, vagy tehetsz bele kezdő bónuszt
        };
        this.login(user);
        return true;
    }
};


// -------------------------------------------------------------------------
// 3. UI KOMPONENSEK (Web Components)
// -------------------------------------------------------------------------

/**
 * Dinamikus Navigációs Sáv (<custom-navbar>)
 */
class CustomNavbar extends HTMLElement {
    connectedCallback() {
        this.render();
        // Újrarajzolás, ha be/kijelentkezik valaki
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
        
        // Csinosított név a navbarba
        let displayName = user ? (user.name ? user.name.split(' ')[0] : user.email.split('@')[0]) : '';
        
        // Jobb oldali menü összeállítása (belépve vs kilépve)
        let rightMenuHtml = user ? `
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
            </div>` : `
            <a href="login.html" class="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white px-5 py-2 rounded-full text-sm font-bold transition ml-4 flex items-center gap-2 shadow-lg shadow-primary-900/20">
                <i data-feather="user" class="w-4 h-4"></i> Belépés
            </a>`;

        this.innerHTML = `
            <nav class="bg-gray-900/90 backdrop-blur-md border-b border-gray-800 fixed w-full z-50 top-0 transition-all duration-300">
                <div class="container mx-auto px-4 py-3 flex justify-between items-center">
                    <a href="index.html" class="flex items-center gap-2 font-bold text-xl text-white">
                        <img src="https://huggingface.co/spaces/ben0ke/aurorapay-p-nzvar-zsl-k-fiataloknak/resolve/main/images/auroralogo.png" class="h-8" alt="Logo"> AuroraPay
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
            </nav>`;
            
        // Ikonok újrarajzolása
        if(typeof feather !== 'undefined') feather.replace();
    }
}
// Csak akkor definiáljuk, ha még nem létezik (hiba elkerülése)
if (!customElements.get('custom-navbar')) {
    customElements.define('custom-navbar', CustomNavbar);
}

/**
 * Egyszerű Lábléc (<custom-footer>)
 */
class CustomFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer class="bg-gray-900 border-t border-gray-800 py-8 mt-auto">
                <div class="container mx-auto px-4 text-center text-gray-400 text-sm">
                    <p>&copy; ${new Date().getFullYear()} AuroraPay Zrt. Minden jog fenntartva.</p>
                </div>
            </footer>`;
    }
}
if (!customElements.get('custom-footer')) {
    customElements.define('custom-footer', CustomFooter);
}


// -------------------------------------------------------------------------
// 4. OLDALSPECIFIKUS LOGIKÁK
// -------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 4.1. Regisztrációs űrlap kezelése (login.html) ---
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        // Ha be van lépve, ne regisztráljon újra
        if (AuthService.getUser() && !window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'dashboard.html';
        }

        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Gomb animáció
            const submitBtn = document.getElementById('submitSignup');
            if(submitBtn) { 
                submitBtn.disabled = true; 
                submitBtn.innerHTML = '<i class="animate-spin" data-feather="loader"></i> Feldolgozás...';
                if(window.feather) feather.replace();
            }
            
            const name = document.getElementById('fullname')?.value || 'Felhasználó';
            const email = document.getElementById('email')?.value || '';
            const age = document.getElementById('age')?.value || '18';
            
            setTimeout(() => {
                AuthService.signup(name, email, age);
                window.location.href = 'dashboard.html';
            }, 800);
        });
    }

    // --- 4.2. Dashboard védelem és adatfeltöltés (dashboard.html) ---
    if (window.location.pathname.includes('dashboard.html')) {
        const user = AuthService.getUser();
        
        // Ha nincs bejelentkezve, kidobjuk
        if (!user) { 
            window.location.href = 'login.html'; 
            return; 
        }

        // Adatok kiírása az oldalra, ha a DOM elemek léteznek
        const els = {
            welcome: document.getElementById('welcomeMsg'),
            balance: document.getElementById('balanceDisplay'),
            cardHolder: document.getElementById('cardHolderName'),
            detailsName: document.getElementById('detailsName'),
            iban: document.getElementById('detailsIBAN'),
            tbody: document.getElementById('transactionTableBody')
        };

        if (els.welcome) els.welcome.innerText = `Szia, ${user.name.split(' ')[0]}!`;
        if (els.balance) els.balance.innerText = formatCurrency(user.balance);
        if (els.cardHolder) els.cardHolder.innerText = user.name.toUpperCase();
        if (els.detailsName) els.detailsName.innerText = user.name;
        if (els.iban) els.iban.innerText = user.iban;

        // Tranzakciós tábla generálása
        if (els.tbody && user.transactions) {
            els.tbody.innerHTML = user.transactions.map(tx => {
                const isPositive = tx.amount > 0;
                const statusBadge = `<span class="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">Teljesítve</span>`;
                
                return `
                <tr class="border-b border-gray-800 hover:bg-gray-800/50 transition">
                    <td class="py-4 px-4 text-gray-400">${tx.date}</td>
                    <td class="py-4 px-4 font-medium text-white">${tx.partner}</td>
                    <td class="py-4 px-4 text-gray-400">${tx.cat}</td>
                    <td class="py-4 px-4">${statusBadge}</td>
                    <td class="py-4 px-4 text-right ${isPositive ? 'text-green-400 font-bold' : 'text-white'}">
                        ${isPositive ? '+' : ''}${formatCurrency(tx.amount)}
                    </td>
                    <td class="py-4 px-4 text-center">
                        <button class="text-gray-500 hover:text-primary-400 transition" title="Részletek">
                            <i data-feather="chevron-right" class="w-4 h-4 mx-auto"></i>
                        </button>
                    </td>
                </tr>`;
            }).join('');
        }
    }
});


// -------------------------------------------------------------------------
// 5. VIZUÁLIS EXTRÁK (UI Candy)
// -------------------------------------------------------------------------

/**
 * Preloader (Töltőképernyő) eltüntetése betöltés után
 */
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => preloader.remove(), 700);
        }, 1000);
    }
});

/**
 * Cursor Glow (Kékes fény az egér körül)
 */
const cursorGlow = document.createElement('div');
cursorGlow.style.cssText = `
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(14, 165, 233, 0.12), transparent 70%);
    position: fixed; top: 0; left: 0;
    pointer-events: none; z-index: 0;
    transform: translate(-50%, -50%);
    transition: transform 0.1s ease-out;
    mix-blend-mode: screen;
`;
document.body.appendChild(cursorGlow);

document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
});

/**
 * Élő Értesítések Szimulálása a jobb alsó sarokban
 */
function showNotification() {
    // Ne mutasson újat, ha van már kint egy
    if (document.querySelectorAll('.fake-toast').length > 0) return;

    const messages = [
        { icon: 'user-plus', text: 'Új felhasználó regisztrált innen: Budapest', color: 'text-blue-400' },
        { icon: 'dollar-sign', text: 'Kovács Anna 5.000 Ft-ot utalt', color: 'text-green-400' },
        { icon: 'shield', text: 'Biztonsági ellenőrzés sikeres', color: 'text-purple-400' }
    ];

    const msg = messages[Math.floor(Math.random() * messages.length)];

    const toast = document.createElement('div');
    toast.className = 'fake-toast fixed bottom-4 right-4 bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 transform translate-y-20 opacity-0 transition-all duration-500 z-50';
    toast.innerHTML = `
        <div class="bg-gray-700/50 p-2 rounded-full ${msg.color}">
            <i data-feather="${msg.icon}" class="w-4 h-4"></i>
        </div>
        <div>
            <p class="text-xs text-gray-400">Éppen most</p>
            <p class="text-sm font-medium">${msg.text}</p>
        </div>
    `;

    document.body.appendChild(toast);
    if(typeof feather !== 'undefined') feather.replace();

    // Beúszik
    setTimeout(() => toast.classList.remove('translate-y-20', 'opacity-0'), 100);
    // Eltűnik
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// Értesítések indítása véletlenszerűen
setTimeout(() => {
    setInterval(() => {
        if(Math.random() > 0.6) showNotification();
    }, 10000); // 10 másodpercenként próbálkozik
}, 3000);


// -------------------------------------------------------------------------
// 6. AURORA AI CHATBOT LOGIKA
// -------------------------------------------------------------------------

// Ablak nyitása/zárása
window.toggleChat = function() {
    const chat = document.getElementById('chatWindow');
    if (!chat) return;
    
    chat.classList.toggle('hidden');
    
    // Időbélyeg
    const now = new Date();
    const timeEl = document.getElementById('chatTime');
    if(timeEl) timeEl.innerText = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();

    // Kezdő üzenet
    if (!chat.classList.contains('hidden') && chat.dataset.started !== 'true') {
        chat.dataset.started = 'true';
        setTimeout(() => {
            addBotMessage("Szia! 👋 Én az Aurora AI vagyok.");
            setTimeout(() => addBotMessage("Kérdezhetsz tőlem ilyesmiket:<br>• Mennyi pénzem van?<br>• Biztonságos az app?"), 800);
        }, 500);
    }
};

function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    if(chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addBotMessage(text) {
    const msgs = document.getElementById('chatMessages');
    if (!msgs) return;
    msgs.innerHTML += `
        <div class="flex justify-start mb-4 animate-fade-in">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-xs font-bold text-white mr-2 flex-shrink-0">AI</div>
            <div class="bg-gray-800 border border-gray-700 text-gray-200 p-3 rounded-2xl rounded-tl-none text-sm max-w-[80%] shadow-md">
                ${text}
            </div>
        </div>`;
    scrollToBottom();
}

function addUserMessage(text) {
    const msgs = document.getElementById('chatMessages');
    if (!msgs) return;
    msgs.innerHTML += `
        <div class="flex justify-end mb-4 animate-fade-in">
            <div class="bg-primary-600 text-white p-3 rounded-2xl rounded-tr-none text-sm max-w-[80%] shadow-lg">
                ${text}
            </div>
        </div>`;
    scrollToBottom();
}

// Üzenetküldés gomb és Enter figyelése
document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('chatSendBtn');
    const input = document.getElementById('chatInput');

    const handleSend = () => {
        const text = input.value.trim();
        if (!text) return;

        addUserMessage(text);
        input.value = "";

        // Gondolkodás animáció
        const msgs = document.getElementById('chatMessages');
        const loaderId = 'load-' + Date.now();
        msgs.innerHTML += `
            <div id="${loaderId}" class="flex justify-start mb-4">
                <div class="bg-gray-700 p-3 rounded-2xl rounded-tl-none text-sm flex gap-1">
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></span>
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
                </div>
            </div>`;
        scrollToBottom();

        // Válasz generálása
        setTimeout(() => {
            const loader = document.getElementById(loaderId);
            if(loader) loader.remove();
            
            // Egyszerű AI válasz logika
            let response = "Bocsi, ezt nem értem teljesen. Próbáld kérdezni az egyenlegemről, a funkciókról vagy a biztonságról!";
            const lower = text.toLowerCase();
            
            if (lower.includes('egyenleg') || lower.includes('pénz')) {
                const u = AuthService.getUser();
                response = u ? `A jelenlegi egyenleged <strong>${formatCurrency(u.balance)}</strong>.` : "Nem vagy bejelentkezve.";
            } else if (lower.includes('biztonság') || lower.includes('ellop')) {
                response = "Banki szintű AES-256 titkosítást használunk, és az OBA védelmet nyújt a számládra.";
            } else if (lower.includes('ingyen') || lower.includes('mennyibe')) {
                response = "Diákoknak a szolgáltatásunk teljesen <strong>ingyenes</strong>, nincsenek rejtett költségek!";
            } else if (lower.includes('szia') || lower.includes('hell')) {
                response = "Helló! Miben segíthetek?";
            }

            addBotMessage(response);
        }, 1200);
    };

    if (sendBtn) sendBtn.addEventListener('click', handleSend);
    if (input) input.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });
});
