/* =========================================================================
   AuroraPay - KÖZPONTI RENDSZERLOGIKA (Teljes, Strukturált, Nem Minifikált)
   ========================================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Konfigurációs objektum
const firebaseConfig = {
    apiKey: "AIzaSyDd788LrFh74TDT30tLiztwNw4NHKFtAn0",
    authDomain: "ben0ke-aurorapay.firebaseapp.com",
    projectId: "ben0ke-aurorapay",
    databaseURL: "https://ben0ke-aurorapay-default-rtdb.europe-west1.firebasedatabase.app",
    storageBucket: "ben0ke-aurorapay.appspot.com",
    messagingSenderId: "912422844408",
    appId: "1:912422844408:web:c773ffbfea970e128a880d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Valutaformázó segédfüggvény
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('hu-HU', {
        style: 'currency',
        currency: 'HUF',
        maximumFractionDigits: 0
    }).format(amount);
};

// Véletlenszerű IBAN generátor
function generateIBAN() {
    const bankCode = '117';
    const branch = Math.floor(1000 + Math.random() * 9000);
    const account = Math.floor(10000000 + Math.random() * 90000000);
    return `HU42 ${bankCode}7-${branch}-${account}`;
}

// Véletlenszerű múltbéli előzménygenerátor
function generateInitialHistory(startBalance) {
    const partners = ['Netflix', 'Steam Store', 'Tesco', 'MOL Nyrt.', 'McDonalds', 'Diákmunka Kft', 'BKK Zrt', 'Spotify AB', 'RPLN EV'];
    const categories = ['Szórakozás', 'Gaming', 'Élelmiszer', 'Üzemanyag', 'Étkezés', 'Bevétel', 'Közlekedés', 'Szórakozás', 'Bevétel'];

    let history = [{
        date: new Date().toLocaleDateString('hu-HU'),
        partner: 'AuroraPay Kezdőtőke',
        cat: 'Rendszer',
        amount: startBalance,
        status: 'completed'
    }];

    for (let i = 1; i <= 4; i++) {
        const isIncome = Math.random() > 0.75;
        const randIdx = Math.floor(Math.random() * partners.length);
        const amount = isIncome ? Math.floor(Math.random() * 45000) + 12000 : -(Math.floor(Math.random() * 14000) + 1500);

        let txDate = new Date();
        txDate.setDate(txDate.getDate() - i);

        history.push({
            date: txDate.toLocaleDateString('hu-HU'),
            partner: partners[randIdx],
            cat: categories[randIdx],
            amount: amount,
            status: 'completed'
        });
    }
    return history;
}

// CORE METÓDUSOK ÉS KLIENS INTERFÉSZ
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

    signup: async function (name, email, password, age, customBalance) {
        try {
            let finalBalance = parseInt(customBalance);
            if (isNaN(finalBalance) || finalBalance < 1000000) finalBalance = 1000000;
            if (finalBalance > 1000000000) finalBalance = 1000000000;

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const randomHistory = generateInitialHistory(finalBalance);

            const userData = {
                uid: user.uid,
                name: name,
                email: email,
                age: age,
                balance: finalBalance,
                iban: generateIBAN(),
                swift: 'AUROHUHB',
                joined: new Date().toLocaleDateString('hu-HU'),
                badges: ['Újonc'],
                vaults: [
                    { id: 1, name: 'Sziget Fesztivál', target: 50000, current: 0 },
                    { id: 2, name: 'Vésztartalék', target: 200000, current: 0 }
                ],
                transactions: randomHistory
            };

            await setDoc(doc(db, "users", user.uid), userData);
            return true;
        } catch (error) {
            alert("Hiba: " + error.message);
            return false;
        }
    },

    openTransactionModal: function (type) {
        const modal = document.getElementById('transactionModal');
        if (!modal) return;

        document.getElementById('modalTxType').value = type;
        document.getElementById('modalTitle').innerHTML = `<i data-feather="credit-card" class="w-5 h-5"></i> ${type} indítása`;
        document.getElementById('modalTxForm').reset();

        if (type === 'Feltöltés') {
            document.getElementById('modalAccountContainer').classList.add('hidden');
            document.getElementById('modalEmailContainer').classList.add('hidden');
        } else {
            document.getElementById('modalAccountContainer').classList.remove('hidden');
            document.getElementById('modalEmailContainer').classList.remove('hidden');
        }

        modal.classList.remove('hidden');
        if (typeof feather !== 'undefined') feather.replace();
    },

    closeTransactionModal: function () {
        document.getElementById('transactionModal').classList.add('hidden');
    },

    executeModalTransaction: async function (amount, currency, partner, account, email, type) {
        const user = this.getUser();
        if (!user) return;

        let baseAmount = parseInt(amount);
        if (isNaN(baseAmount) || baseAmount <= 0) return;

        let rate = 1;
        let currencySymbol = "Ft";
        if (currency === 'EUR') { rate = 400; currencySymbol = "€"; }
        if (currency === 'USD') { rate = 370; currencySymbol = "$"; }

        let hufEquivalent = baseAmount * rate;
        let finalAmountForTable = type === 'Feltöltés' ? hufEquivalent : -hufEquivalent;

        if (type !== 'Feltöltés' && user.balance + finalAmountForTable < 0) {
            alert("Sikertelen tranzakció: Nincs elegendő fedezet!");
            return;
        }

        user.balance += finalAmountForTable;
        let fullDescription = partner;
        if (type !== 'Feltöltés' && account) fullDescription += ` (Számla: ${account})`;

        user.transactions.unshift({
            date: new Date().toLocaleDateString('hu-HU'),
            partner: fullDescription,
            cat: type,
            amount: finalAmountForTable,
            status: 'completed'
        });

        if (user.transactions.length >= 6 && !user.badges.includes('Aktív Költekező')) {
            user.badges.push('Aktív Költekező');
        }

        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, {
            balance: user.balance,
            transactions: user.transactions,
            badges: user.badges
        });

        localStorage.setItem('aurorapay_current_user', JSON.stringify(user));
        window.dispatchEvent(new Event('auth-change'));
        this.closeTransactionModal();
        showNotification(`Sikeres ${type}: ${amount} ${currencySymbol}`);
    },

    depositToVault: async function (vaultId) {
        const user = this.getUser();
        if (!user) return;

        const vaultIndex = user.vaults.findIndex(v => v.id === vaultId);
        if (vaultIndex === -1) return;

        let amountStr = prompt(`Mennyit raksz át a(z) "${user.vaults[vaultIndex].name}" zsebbe? (HUF)`);
        if (!amountStr) return;

        let amount = parseInt(amountStr.replace(/\D/g, ''));
        if (isNaN(amount) || amount <= 0) return;

        if (user.balance - amount < 0) {
            alert("Nincs elegendő szabad egyenleged a kártyádon!");
            return;
        }

        user.balance -= amount;
        user.vaults[vaultIndex].current += amount;

        user.transactions.unshift({
            date: new Date().toLocaleDateString('hu-HU'),
            partner: `Zsebbővítés: ${user.vaults[vaultIndex].name}`,
            cat: 'Megtakarítás',
            amount: -amount,
            status: 'completed'
        });

        if (!user.badges.includes('Tudatos Tervező')) {
            user.badges.push('Tudatos Tervező');
        }

        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, {
            balance: user.balance,
            vaults: user.vaults,
            transactions: user.transactions,
            badges: user.badges
        });

        localStorage.setItem('aurorapay_current_user', JSON.stringify(user));
        window.dispatchEvent(new Event('auth-change'));
        showNotification(`Áthelyezve a zsebbe: ${formatCurrency(amount)}`);
    }
};

window.AuthService.init();

// INTERAKTÍV DOM RENDER MOTOR
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const startBalance = document.getElementById('startBalance')?.value || '1000000';
            window.AuthService.signup(
                document.getElementById('fullname')?.value || 'Felhasználó',
                document.getElementById('email')?.value || '',
                document.getElementById('password')?.value || '',
                document.getElementById('age')?.value || '18',
                startBalance
            ).then((success) => { if (success) window.location.href = 'dashboard.html'; });
        });
    }

    if (window.location.pathname.includes('dashboard.html')) {

        document.getElementById('modalTxForm')?.addEventListener('submit', function (e) {
            e.preventDefault();
            window.AuthService.executeModalTransaction(
                document.getElementById('modalAmount').value,
                document.getElementById('modalCurrency').value,
                document.getElementById('modalPartner').value,
                document.getElementById('modalAccount').value,
                document.getElementById('modalEmail').value,
                document.getElementById('modalTxType').value
            );
        });

        const renderRealtimeData = () => {
            const user = window.AuthService.getUser();
            if (!user) return;

            document.getElementById('welcomeMsg').innerText = `Szia, ${user.name.split(' ')[0]}!`;
            document.getElementById('balanceDisplay').innerText = formatCurrency(user.balance);
            document.getElementById('cardHolderName').innerText = user.name.toUpperCase();
            if (document.getElementById('detailsName')) document.getElementById('detailsName').innerText = user.name;
            if (document.getElementById('detailsIBAN')) document.getElementById('detailsIBAN').innerText = user.iban || "Generálás alatt...";

            // Jelvények kirajzolása
            const badgesDiv = document.getElementById('badgesContainer');
            if (badgesDiv && user.badges) {
                badgesDiv.innerHTML = user.badges.map(b => `
                    <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border border-yellow-400/50 shadow-md select-none">
                        ${b}
                    </div>`).join('');
            }

            // Zsebek kezelése pipával
            const vaultsDiv = document.getElementById('vaultsContainer');
            if (vaultsDiv && user.vaults) {
                vaultsDiv.innerHTML = user.vaults.map(v => {
                    const percent = Math.min(100, Math.round((v.current / v.target) * 100));
                    const isCompleted = v.current >= v.target;
                    const checkmark = isCompleted ? '<span class="text-green-400 font-bold ml-2">✅ Kész</span>' : '';

                    return `
                    <div class="bg-gray-800/60 p-4 rounded-xl border border-gray-700/50 flex flex-col justify-between">
                        <div class="flex justify-between text-sm mb-2">
                            <span class="font-bold text-white flex items-center">${v.name} ${checkmark}</span>
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

            // Táblázat
            const tbody = document.getElementById('transactionTableBody');
            if (tbody && user.transactions) {
                tbody.innerHTML = user.transactions.map(tx => {
                    const isPositive = tx.amount > 0;
                    return `
                    <tr class="border-b border-gray-800 hover:bg-gray-800/50 transition">
                        <td class="py-4 px-4 text-gray-400">${tx.date}</td>
                        <td class="py-4 px-4 font-medium text-white">${tx.partner}</td>
                        <td class="py-4 px-4 text-gray-400">${tx.cat}</td>
                        <td class="py-4 px-4"><span class="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">Teljesítve</span></td>
                        <td class="py-4 px-4 text-right ${isPositive ? 'text-green-400 font-bold' : 'text-white'}">${isPositive ? '+' : ''}${formatCurrency(tx.amount)}</td>
                        <td class="py-4 px-4 text-center">
                            <button class="text-gray-500 hover:text-primary-400 transition">
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

        document.getElementById('generateQRBtn')?.addEventListener('click', () => {
            const amount = document.getElementById('splitAmount').value;
            const qrBox = document.getElementById('qrcode');
            const currentUser = window.AuthService.getUser();
            if (amount && amount > 0 && currentUser) {
                qrBox.innerHTML = ''; qrBox.classList.remove('hidden');
                new QRCode(qrBox, { text: `AURORAPAY:${currentUser.iban}?amount=${amount}`, width: 128, height: 128 });
            }
        });
    }
});

// CHATBOT LOGIKA ÉS ASSZISZTENS
window.toggleChat = function () {
    const chat = document.getElementById('chatWindow'); if (!chat) return;
    chat.classList.toggle('hidden');
    if (!chat.classList.contains('hidden') && chat.dataset.started !== 'true') {
        chat.dataset.started = 'true';
        setTimeout(() => addBotMessage("Szia! 👋 Az Aurora AI vagyok. Kérdezz bátran az egyenlegedről, a megszerzett jelvényeidről vagy a megtakarítási zsebeidről!"), 500);
    }
};

function addBotMessage(text) {
    const msgs = document.getElementById('chatMessages'); if (!msgs) return;
    msgs.innerHTML += `<div class="flex justify-start mb-4"><div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-xs font-bold text-white mr-2 flex-shrink-0 shadow-md">AI</div><div class="bg-gray-800 border border-gray-700 text-gray-200 p-3 rounded-2xl rounded-tl-none text-xs max-w-[80%] shadow-sm">${text}</div></div>`;
    msgs.scrollTop = msgs.scrollHeight;
}

function addUserMessage(text) {
    const msgs = document.getElementById('chatMessages'); if (!msgs) return;
    msgs.innerHTML += `<div class="flex justify-end mb-4"><div class="bg-primary-600 text-white p-3 rounded-2xl rounded-tr-none text-xs max-w-[80%] shadow-md">${text}</div></div>`;
    msgs.scrollTop = msgs.scrollHeight;
}

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('chatInput');
    const handleSend = () => {
        const text = input.value.trim(); if (!text) return;
        addUserMessage(text); input.value = "";
        setTimeout(() => {
            const lower = text.toLowerCase(); const user = window.AuthService.getUser();
            let res = "Sajnos ezt még nem tudom feldolgozni. Kérdezz az egyenlegedről, jelvényekről, zsebekről vagy indíts utalást!";
            if (!user) { res = "Kérlek lépj be az adatok lekéréséhez."; }
            else if (lower.includes('egyenleg') || lower.includes('pénz') || lower.includes('mennyi')) res = `A Cloud Firestore-ban tárolt aktuális egyenleged: <strong>${formatCurrency(user.balance)}</strong>.`;
            else if (lower.includes('zseb') || lower.includes('cél') || lower.includes('megtakarítás')) res = "Megtakarítási céljaid helyzete:<br>" + user.vaults.map(v => `• <strong>${v.name}</strong>: ${formatCurrency(v.current)} / ${formatCurrency(v.target)} ${v.current >= v.target ? '✅' : ''}`).join('<br>');
            else if (lower.includes('jelvény') || lower.includes('badge') || lower.includes('plecsni')) res = `A megszerzett plecsnid listája: <strong>${user.badges.join(', ')}</strong>.`;
            else if (lower.includes('utal') || lower.includes('fizet') || lower.includes('küld')) res = `Indíthatunk egy tranzakciót! Kattints az <a href="#" onclick="window.AuthService.openTransactionModal('Utalás')" class="text-primary-400 underline font-bold">ide</a> linkre az egyedi utalási felület megnyitásához.`;
            else if (lower.includes('szia') || lower.includes('hello')) res = `Szia ${user.name.split(' ')[0]}! Milyen banki műveletben segítsek ma?`;
            addBotMessage(res);
        }, 700);
    };
    document.getElementById('chatSendBtn')?.addEventListener('click', handleSend);
    input?.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });
});

// FINTECH TOAST NOTIFICATION RENDSZER
function showNotification(text) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-gray-800 border border-primary-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 transform translate-y-20 opacity-0 transition-all duration-500 z-[9999]';
    toast.innerHTML = `<div class="bg-primary-500/20 p-2 rounded-full text-primary-400"><i data-feather="check-circle" class="w-5 h-5"></i></div><div><p class="text-sm font-medium">${text}</p></div>`;
    document.body.appendChild(toast);
    if (window.feather) feather.replace();
    setTimeout(() => toast.classList.remove('translate-y-20', 'opacity-0'), 100);
    setTimeout(() => { toast.classList.add('translate-y-20', 'opacity-0'); setTimeout(() => toast.remove(), 500); }, 3000);
}

// TAKARÓ RÉTEG (PRELOADER) KEZELŐ
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => preloader.remove(), 700);
        }, 800);
    }
});