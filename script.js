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
            userData.balance = 18890420;
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

// ÉLŐ ÉRTESÍTÉS SZIMULÁTOR
function showNotification() {
    if (document.querySelectorAll('.fake-toast').length > 0) return;

    const messages = [
        { icon: 'user-plus', text: 'Új felhasználó regisztrált innen: Budapest', color: 'text-blue-400' },
        { icon: 'dollar-sign', text: 'Kovács Anna 5.000 Ft-ot utalt', color: 'text-green-400' },
        { icon: 'shield', text: 'Biztonsági ellenőrzés sikeres', color: 'text-purple-400' },
        { icon: 'trending-up', text: 'A Bitcoin árfolyama 2%-ot emelkedett', color: 'text-yellow-400' }
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

    setTimeout(() => {
        toast.classList.remove('translate-y-20', 'opacity-0');
    }, 100);

    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

setTimeout(() => {
    showNotification();
    setInterval(() => {
        if(Math.random() > 0.5) showNotification();
    }, 8000);
}, 2000);

const cursorGlow = document.createElement('div');
cursorGlow.style.cssText = `
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(14, 165, 233, 0.15), transparent 70%);
    position: fixed;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 0; /* A tartalom mögött */
    transform: translate(-50%, -50%);
    transition: transform 0.1s ease-out;
    mix-blend-mode: screen;
`;
document.body.appendChild(cursorGlow);

document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
});

/* Preloader eltüntetése */
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.remove();
            }, 700);
        }, 1500);
    }
});

/* script.js VÉGE - OKOS CHATBOT LOGIKA */

// 1. CHAT NYITÁS / ZÁRÁS
function toggleChat() {
    const chat = document.getElementById('chatWindow');
    chat.classList.toggle('hidden');
    
    // Aktuális idő beállítása
    const now = new Date();
    const timeString = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
    const timeEl = document.getElementById('chatTime');
    if(timeEl) timeEl.innerText = timeString;

    // Ha először nyitjuk meg, köszönjön be az AI
    if (!chat.classList.contains('hidden') && chat.dataset.started !== 'true') {
        chat.dataset.started = 'true';
        setTimeout(() => {
            addBotMessage("Szia! 👋 Én az Aurora AI vagyok. Miben segíthetek ma?");
            // Javaslatok
            setTimeout(() => {
                addBotMessage("Kérdezhetsz tőlem ilyesmiket:<br>• Mennyibe kerül?<br>• Hogyan működik a kártya?<br>• Biztonságos az app?");
            }, 800);
        }, 500);
    }
}

// 2. ÜZENET KÜLDÉSE ÉS FOGADÁSA
document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('chatSendBtn');
    const input = document.getElementById('chatInput');

    if (sendBtn && input) {
        // Klikk esemény
        sendBtn.addEventListener('click', () => handleUserMessage());

        // Enter gomb esemény
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleUserMessage();
        });
    }
});

function handleUserMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    
    if (text === "") return;

    // 1. Felhasználó üzenetének megjelenítése
    addUserMessage(text);
    input.value = ""; // Töröljük a mezőt

    // 2. AI "gondolkodás" szimulálása
    const chatMessages = document.getElementById('chatMessages');
    const loadingId = 'loading-' + Date.now();
    
    // Töltő animáció (három pötty)
    chatMessages.innerHTML += `
        <div id="${loadingId}" class="flex justify-start mb-4 animate-fade-in">
            <div class="bg-gray-700 text-gray-400 p-3 rounded-2xl rounded-tl-none text-sm flex gap-1 items-center">
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></span>
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
            </div>
        </div>
    `;
    scrollToBottom();

    // 3. Válasz generálása (késleltetéssel)
    setTimeout(() => {
        // Töröljük a töltő animációt
        const loader = document.getElementById(loadingId);
        if(loader) loader.remove();

        // Megkeressük a választ az "agyban"
        const response = getAIResponse(text);
        addBotMessage(response);
    }, 1000 + Math.random() * 500); // 1-1.5 mp véletlen késleltetés
}

// 3. MEGJELENÍTŐ FÜGGVÉNYEK
function addUserMessage(text) {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML += `
        <div class="flex justify-end mb-4 animate-fade-in">
            <div class="bg-primary-600 text-white p-3 rounded-2xl rounded-tr-none text-sm max-w-[80%] shadow-lg">
                ${text}
            </div>
        </div>
    `;
    scrollToBottom();
}

function addBotMessage(text) {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML += `
        <div class="flex justify-start mb-4 animate-fade-in">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-xs font-bold text-white mr-2 flex-shrink-0 border border-gray-600">AI</div>
            <div class="bg-gray-800 border border-gray-700 text-gray-200 p-3 rounded-2xl rounded-tl-none text-sm max-w-[80%] shadow-md">
                ${text}
            </div>
        </div>
    `;
    scrollToBottom();
}

function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 4. AZ AI "AGYA" - TUDÁSBÁZIS (Bővített verzió)
function getAIResponse(input) {
    // Kisbetűssé alakítjuk a könnyebb kereséshez
    const lowerInput = input.toLowerCase();
    
    // Adatok lekérése a megszemélyesítéshez
    const user = AuthService.getUser();
    const balance = user ? new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(user.balance) : null;
    const name = user && user.name ? user.name.split(' ')[0] : 'Vendég';

    // --- ÜDVÖZLÉS & SZEMÉLYES ---
    if (lowerInput.includes('szia') || lowerInput.includes('hello') || lowerInput.includes('helló') || lowerInput.includes('cső') || lowerInput.includes('jónapot')) {
        return `Szia ${name}! 👋 Örülök, hogy itt vagy. Miben segíthetek a pénzügyeiddel kapcsolatban?`;
    }

    if (lowerInput.includes('hogy vagy')) {
        return "Köszönöm, remekül! 🚀 A szervereim hűtése optimális, és készen állok a válaszadásra.";
    }

    if (lowerInput.includes('kösz')) {
        return "Nagyon szívesen! 😊 Ha van még kérdésed, csak írj.";
    }

    // --- FUNKCIÓK & EGYENLEG (Dinamikus!) ---
    if (lowerInput.includes('egyenleg') || lowerInput.includes('pénzem') || lowerInput.includes('mennyi') && lowerInput.includes('van')) {
        if (user) {
            return `A jelenlegi egyenleged: <strong>${balance}</strong>. Ezt a vezérlőpulton is láthatod.`;
        } else {
            return "Jelenleg nem vagy bejelentkezve. Lépj be, hogy lássam az egyenlegedet!";
        }
    }

    if (lowerInput.includes('számlaszám') || lowerInput.includes('iban')) {
        if (user && user.iban) {
            return `A számlaszámod: <br><code class="bg-gray-700 px-2 py-1 rounded text-xs">${user.iban}</code><br>Ezt használhatod utalások fogadására.`;
        } else {
            return "A számlaszámodat a Vezérlőpulton, a 'Számlainformációk' dobozban találod belépés után.";
        }
    }

    if (lowerInput.includes('utal') || lowerInput.includes('küld') || lowerInput.includes('fizet')) {
        return "Pénzt küldeni nagyon egyszerű: A Vezérlőpulton kattints az 'Utalás' gombra, add meg a partner nevét vagy számlaszámát, és az összeg azonnal megérkezik!";
    }

    // --- ÁLTALÁNOS INFÓK ---
    if (lowerInput.includes('ingyen') || lowerInput.includes('ár') || lowerInput.includes('költség') || lowerInput.includes('díj')) {
        return "Az AuroraPay alapcsomagja diákoknak <strong>örökre ingyenes</strong>! Nincs havidíj, és az utalások is díjmentesek belföldön.";
    }

    if (lowerInput.includes('kártya') || lowerInput.includes('mastercard')) {
        return "Regisztráció után kapsz egy virtuális kártyát (Apple/Google Pay kompatibilis). Ha szeretnél világító Neon fémkártyát, azt a 'Fiókom' menüben rendelheted meg.";
    }

    if (lowerInput.includes('kripto') || lowerInput.includes('bitcoin') || lowerInput.includes('coin')) {
        return "Igen! 🚀 Támogatjuk a kriptovalutákat. Bitcoin, Ethereum és további 20 coin érhető el. Válthatsz és tárolhatsz is nálunk.";
    }

    if (lowerInput.includes('biztonság') || lowerInput.includes('ellop') || lowerInput.includes('csal')) {
        return "Banki szintű titkosítást (AES-256) használunk. A pénzedet az OBA védi 100.000 euróig, és a kártyádat egy gombnyomással fagyaszthatod az appban.";
    }

    // --- TECH SUPPORT ---
    if (lowerInput.includes('jelszó') || lowerInput.includes('elfelejt')) {
        return "Semmi gond! A bejelentkezési képernyőn kattints az 'Elfelejtett jelszó' linkre, és küldünk egy visszaállító emailt.";
    }

    if (lowerInput.includes('ügyfélszolgálat') || lowerInput.includes('ember') || lowerInput.includes('hiba') || lowerInput.includes('support')) {
        return "Írhatsz nekünk a <strong>support@aurorapay.hu</strong> címre, vagy hívhatod a +36 1 123 4567 számot (H-P 8:00-16:00).";
    }

    // --- BEMUTATÓ SPECIFIKUS & ÉRDEKESSÉGEK ---
    if (lowerInput.includes('ki vagy') || lowerInput.includes('mi ez')) {
        return "Én az Aurora AI vagyok. Ez az applikáció pedig azért készült, hogy a Z generáció végre érthetően és egyszerűen kezelhesse a pénzügyeit.";
    }

    if (lowerInput.includes('alapító') || lowerInput.includes('ceo') || lowerInput.includes('tulaj')) {
        return "Az AuroraPay-t <strong>Kovács Benjámin</strong> alapította azzal a céllal, hogy forradalmasítsa a fiatalok bankolását.";
    }

    if (lowerInput.includes('vicc')) {
        return "Miért szakított a bankár a barátnőjével? <br> Mert elvesztette az érdeklődését (kamatot)! 😂";
    }
    
    if (lowerInput.includes('gazdag')) {
         if (user && user.balance > 100000) {
            return "Hát, van " + balance + "-od, szóval egész jól állsz! 😎";
         } else {
             return "A pénz nem boldogít... de azért jó, ha van. Gyűjts tovább az AuroraPay-jel!";
         }
    }

    // Ha nem érti
    return "Ezt sajnos még nem értem. 😅 Próbálj kulcsszavakat használni, pl.: 'egyenleg', 'kártya', 'biztonság', 'utalás', 'kripto'.";
}

// Add ezt a script.js végéhez, vagy frissítsd az AuthService-t
const AuthService = {
    // Regisztráció és mentés LocalStorage-ba
    signup: (name, email, age) => {
        const user = {
            name: name,
            email: email,
            age: age,
            balance: 150000, // Kezdő egyenleg a demóhoz
            iban: "HU42 1177 3000 1234 5678 9012 3456",
            swift: "AUROHUHB",
            joined: new Date().toLocaleDateString('hu-HU')
        };
        localStorage.setItem('aurora_user', JSON.stringify(user));
        return true;
    },

    // Felhasználó lekérése
    getUser: () => {
        const user = localStorage.getItem('aurora_user');
        return user ? JSON.parse(user) : null;
    },

    // Kijelentkezés
    logout: () => {
        localStorage.removeItem('aurora_user');
        window.location.href = 'index.html';
    }
};

// Eseménykezelő a login.html-hez
if (document.getElementById('signupForm')) {
    document.getElementById('signupForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('fullname').value;
        const email = document.getElementById('email').value;
        const age = document.getElementById('age').value;

        if (AuthService.signup(name, email, age)) {
            // Animált átmenet szimulálása
            const btn = document.getElementById('submitSignup');
            btn.innerHTML = '<i class="animate-spin" data-feather="loader"></i> Belépés...';
            feather.replace();
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        }
    });
}
