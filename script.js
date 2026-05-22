/* =========================================================================
   AuroraPay - KÖZPONTI RENDSZERLOGIKA (Végleges, Felokosított Firestore Verzió)
   ========================================================================= */

// 1. FIREBASE IMPORTÁLÁSA (Ennek mindig legelöl kell lennie!)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// !!! Az általad megadott pontos, éles Firebase Config adatok !!!
const firebaseConfig = {
    apiKey: "AIzaSyDd788LrFh74TDT30tLiztwNw4NHKFtAn0",
    authDomain: "ben0ke-aurorapay.firebaseapp.com",
    projectId: "ben0ke-aurorapay",
    databaseURL: "https://ben0ke-aurorapay-default-rtdb.europe-west1.firebasedatabase.app",
    storageBucket: "ben0ke-aurorapay.appspot.com",
    messagingSenderId: "912422844408",
    appId: "1:912422844408:web:c773ffbfea970e128a880d"
};

// Firebase Inicializálása
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


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


// 3. AUTH SERVICE (Adatbázis és Belépés Kezelése)
window.AuthService = {
    init: function () {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    localStorage.setItem('aurorapay_current_user', JSON.stringify(docSnap.data()));
                    window.dispatchEvent(new Event('auth-change'));
                }
            } else {
                localStorage.removeItem('aurorapay_current_user');
                window.dispatchEvent(new Event('auth-change'));
            }
        });
    },

    getUser: function () {
        const data = localStorage.getItem('aurorapay_current_user');
        return data ? JSON.parse(data) : null;
    },

    logout: function () {
        signOut(auth).then(() => {
            localStorage.removeItem('aurorapay_current_user');
            window.location.href = 'index.html';
        });
    },

    // FELADAT: Regisztráció kibővítése dinamikus egyenleggel és zsebekkel
    signup: async function (name, email, password, age, customBalance) {
        try {
            // Egyenleg normalizálása a kért határok között (1M - 1Mrd Ft)
            let finalBalance = parseInt(customBalance);
            if (isNaN(finalBalance) || finalBalance < 1000000) finalBalance = 1000000;
            if (finalBalance > 1000000000) finalBalance = 1000000000;

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userData = {
                uid: user.uid,
                name: name,
                email: email,
                age: age,
                balance: finalBalance,
                iban: generateIBAN(),
                swift: 'AUROHUHB',
                joined: new Date().toLocaleDateString('hu-HU'),
                badges: ['Újonc'], // Alapértelmezett kezdő jelvény (Gamification)
                vaults: [ // Alapértelmezett megtakarítási zsebek (Savings Vaults)
                    { id: 1, name: 'Sziget Fesztivál', target: 50000, current: 0 },
                    { id: 2, name: 'Vésztartalék', target: 200000, current: 0 }
                ],
                transactions: [
                    { date: new Date().toLocaleDateString('hu-HU'), partner: 'AuroraPay Kezdőtőke', cat: 'Bevétel', amount: finalBalance, status: 'completed' }
                ]
            };

            await setDoc(doc(db, "users", user.uid), userData);
            return true;
        } catch (error) {
            console.error("Hiba történt a regisztráció során:", error.message);
            alert("Hiba: " + error.message);
            return false;
        }
    },

    // FELADAT: Tranzakciók (Utalás, Feltöltés, Csekk) Szimulációja és Mentése
    simulateTransaction: async function (type) {
        const user = this.getUser();
        if (!user) return;

        let amountStr = prompt(`Mennyit szeretnél ${type === 'Feltöltés' ? 'feltölteni a számládra' : 'utalni / fizetni'}? (HUF)`);
        if (!amountStr) return;

        let amount = parseInt(amountStr.replace(/\D/g, ''));
        if (isNaN(amount) || amount <= 0) {
            alert("Érvénytelen összeg!");
            return;
        }

        if (type !== 'Feltöltés') {
            amount = -amount;
        }

        if (user.balance + amount < 0) {
            alert("Sikertelen tranzakció: Nincs elegendő fedezet a számládon!");
            return;
        }

        let partner = prompt("Add meg a partner nevét vagy a leírást (pl. Tesco, Netflix, MOL):");
        if (!partner) partner = type;

        // Helyi adatok frissítése
        user.balance += amount;
        user.transactions.unshift({
            date: new Date().toLocaleDateString('hu-HU'),
            partner: partner,
            cat: type,
            amount: amount,
            status: 'completed'
        });

        // Játékosítás (Gamification) - Jelvények adományozása mérföldköveknél
        if (user.transactions.length >= 5 && !user.badges.includes('Aktív Költekező')) {
            user.badges.push('Aktív Költekező');
        }
        if (user.balance > 10000000 && !user.badges.includes('Milliárdos növendék')) {
            user.badges.push('Milliárdos növendék');
        }

        // Felhő alapú adatbázis mentés és szinkronizáció
        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, {
            balance: user.balance,
            transactions: user.transactions,
            badges: user.badges
        });

        localStorage.setItem('aurorapay_current_user', JSON.stringify(user));
        window.dispatchEvent(new Event('auth-change'));
        if (typeof showNotification === 'function') showNotification(`${type} sikeresen feldolgozva!`);
    },

    // FELADAT: Zsebek logikája és Adatbázis mentése (Befizetés)
    depositToVault: async function (vaultId) {
        const user = this.getUser();
        if (!user) return;

        const vaultIndex = user.vaults.findIndex(v => v.id === vaultId);
        if (vaultIndex === -1) return;

        let amountStr = prompt(`Mennyit szeretnél félretenni a(z) "${user.vaults[vaultIndex].name}" zsebbe? (HUF)`);
        if (!amountStr) return;

        let amount = parseInt(amountStr.replace(/\D/g, ''));
        if (isNaN(amount) || amount <= 0) return;

        if (user.balance - amount < 0) {
            alert("Nincs elegendő szabad egyenleged a megtakarításhoz!");
            return;
        }

        // Logikai elszámolás: Levonás a főegyenlegből, hozzáadás a zsebhez
        user.balance -= amount;
        user.vaults[vaultIndex].current += amount;

        user.transactions.unshift({
            date: new Date().toLocaleDateString('hu-HU'),
            partner: `Cél: ${user.vaults[vaultIndex].name}`,
            cat: 'Megtakarítás',
            amount: -amount,
            status: 'completed'
        });

        if (!user.badges.includes('Tudatos Tervező')) {
            user.badges.push('Tudatos Tervező');
        }

        // Mentés Cloud Firestore-ba
        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, {
            balance: user.balance,
            vaults: user.vaults,
            transactions: user.transactions,
            badges: user.badges
        });

        localStorage.setItem('aurorapay_current_user', JSON.stringify(user));
        window.dispatchEvent(new Event('auth-change'));
        if (typeof showNotification === 'function') showNotification("Sikeres megtakarítás!");
    }
};

// Figyelő elindítása
window.AuthService.init();


// 4. UI KOMPONENSEK (Navigáció és Lábléc)
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
        if (typeof feather !== 'undefined') feather.replace();
    }
}
if (!customElements.get('custom-navbar')) customElements.define('custom-navbar', CustomNavbar);


class CustomFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<footer class="bg-gray-900 border-t border-gray-800 py-8 mt-auto"><div class="container mx-auto px-4 text-center text-gray-400 text-sm"><p>&copy; ${new Date().getFullYear()} AuroraPay Zrt. Minden jog fenntartva.</p></div></footer>`;
    }
}
if (!customElements.get('custom-footer')) customElements.define('custom-footer', CustomFooter);


// 5. OLDAL LOGIKÁK (Űrlap és Dashboard)
document.addEventListener('DOMContentLoaded', () => {

    // Regisztrációs űrlap
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        if (window.AuthService.getUser() && !window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'dashboard.html';
        }

        signupForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const submitBtn = document.getElementById('submitSignup');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="animate-spin" data-feather="loader"></i> Feldolgozás...';
                if (window.feather) feather.replace();
            }

            const name = document.getElementById('fullname')?.value || 'Felhasználó';
            const email = document.getElementById('email')?.value || '';
            const password = document.getElementById('password')?.value || '';
            const age = document.getElementById('age')?.value || '18';
            const startBalance = document.getElementById('startBalance')?.value || '18890420'; // Új dinamikus input

            window.AuthService.signup(name, email, password, age, startBalance).then((success) => {
                if (success) {
                    window.location.href = 'dashboard.html';
                } else {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = 'Újrapróbálkozás';
                    }
                }
            });
        });
    }

    // Dashboard Adatbetöltés és Dinamikus DOM frissítés
    if (window.location.pathname.includes('dashboard.html')) {
        const renderRealtimeData = () => {
            const user = window.AuthService.getUser();
            if (!user) return;

            // Alapértelmezett elemek frissítése az adatbázisból
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
            if (els.iban) els.iban.innerText = user.iban || "Generálás alatt...";

            // JÁTÉKOSÍTÁS: Jelvények lerenderelése a felületről
            const badgesDiv = document.getElementById('badgesContainer');
            if (badgesDiv && user.badges) {
                badgesDiv.innerHTML = user.badges.map(b =>
                    `<div class="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-full shadow-lg border border-yellow-400/50 select-none">${b}</div>`
                ).join('');
            }

            // ZSEBEK KIALAKÍTÁSA: Haladási sávok dinamikus számítása
            const vaultsDiv = document.getElementById('vaultsContainer');
            if (vaultsDiv && user.vaults) {
                vaultsDiv.innerHTML = user.vaults.map(v => {
                    const percent = Math.min(100, Math.round((v.current / v.target) * 100));
                    return `
                    <div class="bg-gray-800/60 p-4 rounded-xl border border-gray-700/50 flex flex-col justify-between">
                        <div class="flex justify-between text-sm mb-2">
                            <span class="font-bold text-white">${v.name}</span>
                            <span class="text-primary-400 font-mono">${formatCurrency(v.current)}</span>
                        </div>
                        <div class="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                            <div class="bg-primary-500 h-2.5 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)] transition-all duration-500" style="width: ${percent}%"></div>
                        </div>
                        <div class="flex justify-between text-[10px] text-gray-500 mb-3">
                            <span>${percent}% teljesítve</span>
                            <span>Cél: ${formatCurrency(v.target)}</span>
                        </div>
                        <button onclick="window.AuthService.depositToVault(${v.id})" class="w-full bg-gray-700 hover:bg-gray-600 text-white text-xs py-1.5 rounded-lg transition font-medium">Befizetés a zsebbe</button>
                    </div>`;
                }).join('');
            }

            // Valós tranzakciók renderelése a táblázatba
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
                        <td class="py-4 px-4 text-center">
                            <button class="text-gray-500 hover:text-primary-400 transition" title="Számla letöltése">
                                <i data-feather="download-cloud" class="w-4 h-4 mx-auto"></i>
                            </button>
                        </td>
                    </tr>`;
                }).join('');
                if (typeof feather !== 'undefined') feather.replace();
            }
        };

        renderRealtimeData();
        window.addEventListener('auth-change', renderRealtimeData);

        // SZÁMLASZÉTDOBÁS: QR Kód eseménykezelő logika
        document.getElementById('generateQRBtn')?.addEventListener('click', () => {
            const amount = document.getElementById('splitAmount').value;
            const qrBox = document.getElementById('qrcode');
            const currentUser = window.AuthService.getUser();
            if (amount && amount > 0 && currentUser) {
                qrBox.innerHTML = '';
                qrBox.classList.remove('hidden');
                new QRCode(qrBox, {
                    text: `AURORAPAY:${currentUser.iban}?amount=${amount}`,
                    width: 128, height: 128
                });
            }
        });
    }
});

// -----------------------------------------------------------------
// 6. AURORA AI CHATBOT OKOSÍTÁS LOGIKA
// -----------------------------------------------------------------
window.toggleChat = function () {
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
    msgs.innerHTML += `<div class="flex justify-start mb-4"><div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-xs font-bold text-white mr-2 flex-shrink-0 shadow-md">AI</div><div class="bg-gray-800 border border-gray-700 text-gray-200 p-3 rounded-2xl rounded-tl-none text-xs max-w-[80%] shadow-sm">${text}</div></div>`;
    msgs.scrollTop = msgs.scrollHeight;
}

function addUserMessage(text) {
    const msgs = document.getElementById('chatMessages');
    if (!msgs) return;
    msgs.innerHTML += `<div class="flex justify-end mb-4"><div class="bg-primary-600 text-white p-3 rounded-2xl rounded-tr-none text-xs max-w-[80%] shadow-md">${text}</div></div>`;
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
            let res = "Sajnos ezt még nem tudom feldolgozni. Kérdezz az egyenlegedről, jelvényekről, zsebekről vagy indíts utalást!";

            if (!user) {
                res = "Kérlek lépj be az adatok lekéréséhez.";
            } else if (lower.includes('egyenleg') || lower.includes('pénz') || lower.includes('mennyi')) {
                res = `A Cloud Firestore-ban tárolt aktuális egyenleged: <strong>${formatCurrency(user.balance)}</strong>.`;
            } else if (lower.includes('zseb') || lower.includes('cél') || lower.includes('megtakarítás')) {
                res = "Megtakarítási céljaid helyzete:<br>" + user.vaults.map(v => `• <strong>${v.name}</strong>: ${formatCurrency(v.current)} / ${formatCurrency(v.target)}`).join('<br>');
            } else if (lower.includes('jelvény') || lower.includes('badge') || lower.includes('plecsni')) {
                res = `A megszerzett plecsnid listája: <strong>${user.badges.join(', ')}</strong>.`;
            } else if (lower.includes('utal') || lower.includes('fizet') || lower.includes('küld')) {
                res = `Indíthatunk egy tranzakciót! Kattints az <a href="#" onclick="window.AuthService.simulateTransaction('Utalás')" class="text-primary-400 underline font-bold">ide</a> linkre az utalás panel megnyitásához.`;
            } else if (lower.includes('szia') || lower.includes('hello')) {
                res = `Szia ${user.name.split(' ')[0]}! Milyen banki műveletben segítsek ma?`;
            }
            addBotMessage(res);
        }, 700);
    };

    document.getElementById('chatSendBtn')?.addEventListener('click', handleSend);
    input?.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });
});

// Globális Értesítő UI Toast generátor modul
function showNotification(text) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-gray-800 border border-primary-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 transform translate-y-20 opacity-0 transition-all duration-500 z-[9999]';
    toast.innerHTML = `<div class="bg-primary-500/20 p-2 rounded-full text-primary-400"><i data-feather="check-circle" class="w-5 h-5"></i></div><div><p class="text-sm font-medium">${text}</p></div>`;
    document.body.appendChild(toast);
    if (window.feather) feather.replace();
    setTimeout(() => toast.classList.remove('translate-y-20', 'opacity-0'), 100);
    setTimeout(() => { toast.classList.add('translate-y-20', 'opacity-0'); setTimeout(() => toast.remove(), 500); }, 3000);
}

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