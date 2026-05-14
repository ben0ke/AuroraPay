/* =========================================================================
   AuroraPay - KÖZPONTI RENDSZERLOGIKA (Végleges, Firebase Verzió)
   ========================================================================= */

// 1. FIREBASE IMPORTÁLÁSA (Ennek mindig legelöl kell lennie!)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// !!! IDE MÁSOLD A SAJÁT FIREBASE CONFIG ADATAIDAT !!!
const firebaseConfig = {
  apiKey: "AIzaSyB-IDE-A-SAJAT-KULCSOD-JON-IDE",
  authDomain: "aurorapay-xxxxx.firebaseapp.com",
  projectId: "aurorapay-xxxxx",
  storageBucket: "aurorapay-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
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
    init: function() {
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

            const userData = {
                uid: user.uid,
                name: name,
                email: email,
                age: age,
                balance: 18890420,
                iban: generateIBAN(),
                swift: 'AUROHUHB',
                joined: new Date().toLocaleDateString('hu-HU'),
                transactions: [
                    { date: '2024.05.14', partner: 'AuroraPay Bónusz', cat: 'Bevétel', amount: 18890420, status: 'completed' }
                ]
            };

            await setDoc(doc(db, "users", user.uid), userData);
            return true;
        } catch (error) {
            console.error("Hiba történt a regisztráció során:", error.message);
            alert("Hiba: " + error.message);
            return false;
        }
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


// 5. OLDAL LOGIKÁK (Űrlap és Dashboard)
document.addEventListener('DOMContentLoaded', () => {
    
    // Regisztrációs űrlap
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
            const password = document.getElementById('password')?.value || ''; // Szükséges a Firebase-hez!
            const age = document.getElementById('age')?.value || '18';
            
            // Firebase Regisztráció meghívása
            window.AuthService.signup(name, email, password, age).then((success) => {
                if(success) {
                    window.location.href = 'dashboard.html';
                } else {
                    // Ha hiba van (pl. foglalt email), engedjük újra próbálkozni
                    if(submitBtn) { 
                        submitBtn.disabled = false; 
                        submitBtn.innerHTML = 'Újrapróbálkozás'; 
                    }
                }
            });
        });
    }

    // Dashboard Adatbetöltés
    if (window.location.pathname.includes('dashboard.html')) {
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
    }
});

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
