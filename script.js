/* =========================================================================
   AuroraPay - KÖZPONTI RENDSZERLOGIKA (Végleges, Realtime Database Verzió)
   ========================================================================= */

// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
 const firebaseConfig = {
    apiKey: "AIzaSyDd788LrFh74TDT30tLiztwNw4NHKFtAn0",
    authDomain: "ben0ke-aurorapay.firebaseapp.com",
    databaseURL: "https://ben0ke-aurorapay-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "ben0ke-aurorapay",
    storageBucket: "ben0ke-aurorapay.firebasestorage.app",
    messagingSenderId: "912422844408",
    appId: "1:912422844408:web:c773ffbfea970e128a880d",
    measurementId: "G-H49296GLP7"
  };


// Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

// Rendszer inicializálása
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const rtdb = getDatabase(app);

// 2. SEGÉDFÜGGVÉNYEK
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(amount);
};

function generateIBAN() {
    const bankCode = '117'; 
    const branch = Math.floor(1000 + Math.random() * 9000); 
    const account = Math.floor(10000000 + Math.random() * 90000000); 
    return `HU42 ${bankCode}7-${branch}-${account}`;
}

// -----------------------------------------------------------------
// 3. REALTIME DATABASE AUTH SERVICE
// -----------------------------------------------------------------
window.AuthService = {
    init: function() {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Adatlekérés a Realtime Database JSON fájlstruktúrájából
                const userRef = ref(rtdb, "users/" + user.uid);
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    localStorage.setItem('aurorapay_current_user', JSON.stringify(snapshot.val()));
                    window.dispatchEvent(new Event('auth-change'));
                }
            } else {
                localStorage.removeItem('aurorapay_current_user');
                window.dispatchEvent(new Event('auth-change'));
            }
        });
    },

    getUser: function() {
        const data = localStorage.getItem('aurorapay_current_user');
        return data ? JSON.parse(data) : null;
    },

    logout: function() {
        signOut(auth).then(() => {
            localStorage.removeItem('aurorapay_current_user');
            window.location.href = 'index.html';
        });
    },

    signup: async function(name, email, password, age) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Zsebekkel és Jelvényekkel kibővített teljes adatmodell a jövőbeli backend mentéshez
            const userData = {
                uid: user.uid,
                name: name,
                email: email,
                age: age,
                balance: 18890420,
                iban: generateIBAN(),
                swift: 'AUROHUHB',
                joined: new Date().toLocaleDateString('hu-HU'),
                badges: ['Újonc', 'Tudatos Tervező'], 
                vaults: [ 
                    { id: 1, name: 'Sziget Fesztivál', target: 50000, current: 15000 },
                    { id: 2, name: 'Vésztartalék', target: 200000, current: 80000 }
                ],
                transactions: [
                    { date: new Date().toLocaleDateString('hu-HU'), partner: 'AuroraPay Bónusz', cat: 'Bevétel', amount: 18890420, status: 'completed' }
                ]
            };

            // Mentés a Realtime Database-be a Firestore helyett
            await set(ref(rtdb, "users/" + user.uid), userData);
            return true;
        } catch (error) {
            console.error("Hiba történt a regisztráció során:", error.message);
            alert("Hiba: " + error.message);
            return false;
        }
    }
};

window.AuthService.init();

// -----------------------------------------------------------------
// 4. UI KOMPONENSEK (Navigáció és Lábléc)
// -----------------------------------------------------------------
class CustomNavbar extends HTMLElement {
    connectedCallback() {
        this.render();
        window.addEventListener('auth-change', () => this.render());
    }

    render() {
        const user = window.AuthService.getUser();
        let displayName = user ? (user.name ? user.name.split(' ')[0] : user.email.split('@')[0]) : '';
        let rightMenuHtml = user ? `
            <div class="flex items-center gap-4 ml-4 pl-4 border-l border-gray-700">
                <div class="text-right hidden lg:block">
                    <span class="block text-white text-sm font-bold leading-tight">${displayName}</span>
                    <span class="block text-gray-500 text-xs">Prémium fiók</span>
                </div>
                <a href="dashboard.html" class="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white p-2 rounded-full transition">
                    <i data-feather="user" class="w-5 h-5"></i>
                </a>
                <button onclick="window.AuthService.logout()" class="text-red-400 hover:text-red-300 transition" title="Kilépés">
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
                </div>
            </nav>`;
        if(typeof feather !== 'undefined') feather.replace();
    }
}
if (!customElements.get('custom-navbar')) customElements.define('custom-navbar', CustomNavbar);

class CustomFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<footer class="bg-gray-900 border-t border-gray-800 py-8 mt-auto"><div class="container mx-auto px-4 text-center text-gray-400 text-sm"><p>&copy; ${new Date().getFullYear()} AuroraPay Zrt. Minden jog fenntartva.</p></div></footer>`;
    }
}
if (!customElements.get('custom-footer')) customElements.define('custom-footer', CustomFooter);

// -----------------------------------------------------------------
// 5. OLDAL LOGIKÁK (Űrlap és Dashboard Kezelés)
// -----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    
    // Regisztrációs űrlap eseménykezelő
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        if (window.AuthService.getUser() && !window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'dashboard.html';
        }

        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const submitBtn = document.getElementById('submitSignup');
            if(submitBtn) { 
                submitBtn.disabled = true; 
                submitBtn.innerHTML = '<i class="animate-spin" data-feather="loader"></i> Feldolgozás...';
                if(window.feather) feather.replace();
            }
            
            const name = document.getElementById('fullname')?.value || 'Felhasználó';
            const email = document.getElementById('email')?.value || '';
            const password = document.getElementById('password')?.value || '';
            const age = document.getElementById('age')?.value || '18';
            
            window.AuthService.signup(name, email, password, age).then((success) => {
                if(success) {
                    window.location.href = 'dashboard.html';
                } else {
                    if(submitBtn) { 
                        submitBtn.disabled = false; 
                        submitBtn.innerHTML = 'Újrapróbálkozás'; 
                    }
                }
            });
        });
    }

    // Dashboard Adatbetöltés és Új panelek kirajzolása
    if (window.location.pathname.includes('dashboard.html')) {
        const renderDashboard = () => {
            const user = window.AuthService.getUser();
            if (!user) { window.location.href = 'login.html'; return; }

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

            // Játékosítás (Badges) kirajzolása a HTML-be
            const badgesDiv = document.getElementById('badgesContainer');
            if(badgesDiv && user.badges) {
                badgesDiv.innerHTML = user.badges.map(b => 
                    `<div class="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-full shadow-lg border border-yellow-400/50 select-none">${b}</div>`
                ).join('');
            }

            // Megtakarítási zsebek (Vaults) feltöltése haladási sávval
            const vaultsDiv = document.getElementById('vaultsContainer');
            if(vaultsDiv && user.vaults) {
                vaultsDiv.innerHTML = user.vaults.map(v => {
                    const percent = Math.min(100, Math.round((v.current / v.target) * 100));
                    return `
                    <div class="bg-gray-800/60 p-4 rounded-xl border border-gray-700/50">
                        <div class="flex justify-between text-sm mb-2">
                            <span class="font-bold text-white">${v.name}</span>
                            <span class="text-primary-400 font-mono">${formatCurrency(v.current)}</span>
                        </div>
                        <div class="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                            <div class="bg-primary-500 h-2.5 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]" style="width: ${percent}%"></div>
                        </div>
                        <div class="flex justify-between text-[10px] text-gray-500">
                            <span>${percent}% teljesítve</span>
                            <span>Cél: ${formatCurrency(v.target)}</span>
                        </div>
                    </div>`;
                }).join('');
            }

            // Tranzakciók renderelése
            if (els.tbody && user.transactions) {
                els.tbody.innerHTML = user.transactions.map(tx => {
                    const isPositive = tx.amount > 0;
                    return `
                    <tr class="border-b border-gray-800 hover:bg-gray-800/50 transition">
                        <td class="py-4 px-4 text-gray-400">${tx.date}</td>
                        <td class="py-4 px-4 font-medium text-white">${tx.partner}</td>
                        <td class="py-4 px-4 text-gray-400">${tx.cat}</td>
                        <td class="py-4 px-4"><span class="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">Teljesítve</span></td>
                        <td class="py-4 px-4 text-right ${isPositive ? 'text-green-400 font-bold' : 'text-white'}">
                            ${isPositive ? '+' : ''}${formatCurrency(tx.amount)}
                        </td>
                    </tr>`;
                }).join('');
            }
        };

        renderDashboard();
        window.addEventListener('auth-change', renderDashboard);

        // Számlaszétdobás QR-kód logikája
        document.getElementById('generateQRBtn')?.addEventListener('click', () => {
            const amount = document.getElementById('splitAmount').value;
            const qrBox = document.getElementById('qrcode');
            if(amount && amount > 0) {
                qrBox.innerHTML = '';
                qrBox.classList.remove('hidden');
                new QRCode(qrBox, {
                    text: `AURORAPAY:${window.AuthService.getUser().iban}?amount=${amount}`,
                    width: 128, height: 128
                });
            }
        });
    }
});

// -----------------------------------------------------------------
// 6. INTELLIGENS CHATBOT & UI EXTRÁK
// -----------------------------------------------------------------
window.toggleChat = function() {
    const chat = document.getElementById('chatWindow');
    if (!chat) return;
    chat.classList.toggle('hidden');
    if (!chat.classList.contains('hidden') && chat.dataset.started !== 'true') {
        chat.dataset.started = 'true';
        setTimeout(() => addBotMessage("Szia! 👋 Az Aurora AI vagyok. Kérdezz bátran az egyenlegedről, a megszerzett jelvényeidről vagy a megtakarítási zsebeidről!"), 500);
    }
};

function addBotMessage(text) {
    const msgs = document.getElementById('chatMessages');
    if (!msgs) return;
    msgs.innerHTML += `<div class="flex justify-start mb-4"><div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-xs font-bold text-white mr-2 flex-shrink-0 shadow-md">AI</div><div class="bg-gray-800 border border-gray-700 text-gray-200 p-3 rounded-2xl rounded-tl-none text-sm max-w-[80%] shadow-sm">${text}</div></div>`;
    msgs.scrollTop = msgs.scrollHeight;
}

function addUserMessage(text) {
    const msgs = document.getElementById('chatMessages');
    if (!msgs) return;
    msgs.innerHTML += `<div class="flex justify-end mb-4"><div class="bg-primary-600 text-white p-3 rounded-2xl rounded-tr-none text-sm max-w-[80%] shadow-md">${text}</div></div>`;
    msgs.scrollTop = msgs.scrollHeight;
}

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('chatInput');
    const handleSend = () => {
        const text = input.value.trim();
        if (!text) return;
        addUserMessage(text);
        input.value = "";
        
        setTimeout(() => {
            const lower = text.toLowerCase();
            const user = window.AuthService.getUser();
            let res = "Sajnos ezt a kérdést még nem tudom feldolgozni. Kérdezz az egyenlegedről, jelvényekről vagy zsebekről!";
            
            if (lower.includes('egyenleg') || lower.includes('pénz')) {
                res = user ? `A felhőben tárolt aktuális egyenleged: <strong>${formatCurrency(user.balance)}</strong>.` : "Kérlek, lépj be a fiókodba az egyenleged lekéréséhez.";
            } else if (lower.includes('zseb') || lower.includes('cél') || lower.includes('megtakarítás')) {
                res = user && user.vaults ? "Aktív céljaid állása a Realtime felhőben:<br>" + user.vaults.map(v => `• <strong>${v.name}</strong>: ${formatCurrency(v.current)} / ${formatCurrency(v.target)}`).join('<br>') : "Nincsenek aktív zsebeid konfigurálva.";
            } else if (lower.includes('jelvény') || lower.includes('badge') || lower.includes('plecsni')) {
                res = user ? `A profilodhoz rendelt kitüntetések: <strong>${user.badges.join(', ')}</strong>.` : "A jelvényeid ellenőrzéséhez előbb be kell jelentkezned.";
            } else if (lower.includes('szia') || lower.includes('hello') || lower.includes('helló')) {
                res = `Szia ${user ? user.name.split(' ')[0] : 'Látogató'}! Miben segíthetek ma az AuroraPay-en belül?`;
            } else if (lower.includes('vicc')) {
                res = "Miért nem utalnak a szellemek bankszámlára? <br> Mert szeretik a készpénzt (kész-lényt)! 👻";
            }
            addBotMessage(res);
        }, 800);
    };

    document.getElementById('chatSendBtn')?.addEventListener('click', handleSend);
    input?.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });
});

// ÉLŐ ÉRTESÍTÉSEK (Dinamikus szimuláció)
function showNotification() {
    if (document.querySelectorAll('.fake-toast').length > 0) return;
    const messages = [
        { icon: 'user-plus', text: 'Új felhasználó regisztrált innen: Budapest', color: 'text-blue-400' },
        { icon: 'dollar-sign', text: 'Kovács Anna 5.000 Ft-ot utalt', color: 'text-green-400' },
        { icon: 'shield', text: 'Biztonsági hálózati ellenőrzés sikeres', color: 'text-purple-400' }
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    const toast = document.createElement('div');
    toast.className = 'fake-toast fixed bottom-4 right-4 bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 transform translate-y-20 opacity-0 transition-all duration-500 z-50';
    toast.innerHTML = `<div class="bg-gray-700/50 p-2 rounded-full ${msg.color}"><i data-feather="${msg.icon}" class="w-4 h-4"></i></div><div><p class="text-xs text-gray-400">Éppen most</p><p class="text-sm font-medium">${msg.text}</p></div>`;
    document.body.appendChild(toast);
    if(typeof feather !== 'undefined') feather.replace();
    setTimeout(() => toast.classList.remove('translate-y-20', 'opacity-0'), 100);
    setTimeout(() => { toast.classList.add('translate-y-20', 'opacity-0'); setTimeout(() => toast.remove(), 500); }, 4000);
}
setTimeout(() => { showNotification(); setInterval(() => { if(Math.random() > 0.6) showNotification(); }, 12000); }, 4000);

// Modern kék egérfény (Cursor glow effekt)
const cursorGlow = document.createElement('div');
cursorGlow.style.cssText = "width:400px;height:400px;background:radial-gradient(circle, rgba(14,165,233,0.12), transparent 70%);position:fixed;top:0;left:0;pointer-events:none;z-index:0;transform:translate(-50%,-50%);transition:transform 0.1s ease-out;mix-blend-mode:screen;";
document.body.appendChild(cursorGlow);
document.addEventListener('mousemove', (e) => { cursorGlow.style.left = e.clientX + 'px'; cursorGlow.style.top = e.clientY + 'px'; });

// Preloader eltüntetése
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => preloader.remove(), 700);
        }, 1000);
    }
});
