const windows = document.querySelectorAll('.window');
let currentWindow = 0;

const chosenWishes = [];
let chosenPlace = null;

function showWindow(index) {
    if (index >= windows.length) return;
    windows[currentWindow].classList.remove('active');
    currentWindow = index;
    windows[currentWindow].classList.add('active');

    // финальное окно: сводка + сердечки + уведомление в Telegram
    if (currentWindow === windows.length - 1) {
        showSummary();
        startHearts();
        sendToTelegram();
    }
}

function nextWindow() {
    showWindow(currentWindow + 1);
}

// ---------- Кнопки Yes ----------
document.querySelectorAll('.btn-yes').forEach(btn => {
    btn.addEventListener('click', () => {
        // окно хотелок: нужно выбрать хотя бы одно
        if (btn.id === 'wishes-next' && chosenWishes.length === 0) {
            btn.classList.add('shake');
            setTimeout(() => btn.classList.remove('shake'), 400);
            return;
        }
        // окно места: нужно выбрать место
        if (btn.id === 'place-next' && !chosenPlace) {
            btn.classList.add('shake');
            setTimeout(() => btn.classList.remove('shake'), 400);
            return;
        }
        nextWindow();
    });
});

// ---------- Кнопки No: убегают, а при нажатии превращаются в Yes ----------
function runAway(btn) {
    const pad = 20;
    const maxX = window.innerWidth - btn.offsetWidth - pad;
    const maxY = window.innerHeight - btn.offsetHeight - pad;
    const x = pad + Math.random() * (maxX - pad);
    const y = pad + Math.random() * (maxY - pad);
    btn.classList.add('escaping');
    btn.style.left = x + 'px';
    btn.style.top = y + 'px';
}

document.querySelectorAll('.btn-no').forEach(btn => {
    btn.addEventListener('mouseenter', () => runAway(btn));
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        runAway(btn);
    });

    // если всё-таки поймали — переворачивается в Yes и делает его действие
    btn.addEventListener('click', () => {
        btn.classList.add('flipped');
        btn.textContent = 'Yes';
        setTimeout(() => {
            btn.classList.remove('escaping', 'flipped');
            btn.style.left = '';
            btn.style.top = '';
            nextWindow();
        }, 500);
    });
});

// ---------- Окно 3: мультивыбор хотелок ----------
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
        item.classList.toggle('selected');
        const wish = item.dataset.wish;
        const i = chosenWishes.indexOf(wish);
        if (i === -1) {
            chosenWishes.push(wish);
        } else {
            chosenWishes.splice(i, 1);
        }
    });
});

// ---------- Окно 5: выбор места (одно) ----------
document.querySelectorAll('.place-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.place-item').forEach(p => p.classList.remove('selected'));
        item.classList.add('selected');
        chosenPlace = item.dataset.place;
    });
});

// ---------- Финал ----------
function showSummary() {
    const summary = document.getElementById('final-summary');
    const parts = [];
    if (chosenWishes.length) parts.push('В программе: ' + chosenWishes.join(', '));
    if (chosenPlace) parts.push('Место: ' + chosenPlace);
    summary.textContent = parts.join(' • ');
}

// ---------- Отправка результата в Telegram ----------
const TG_BOT_TOKEN = '8972768597:AAHIbz12PfGlfk9Jv-1kGvqzrjAzyjITz7s';
const TG_CHAT_ID = '5120430509';
let tgSent = false;

function sendToTelegram() {
    if (tgSent) return; // отправляем только один раз
    tgSent = true;

    const lines = ['💘 ОНА СКАЗАЛА ДА!'];
    if (chosenWishes.length) lines.push('🍽 Хочет: ' + chosenWishes.join(', '));
    if (chosenPlace) lines.push('📍 Место: ' + chosenPlace);
    lines.push('🕐 ' + new Date().toLocaleString('ru-RU'));

    fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: TG_CHAT_ID,
            text: lines.join('\n')
        })
    }).catch(() => {}); // ошибка отправки не должна ломать сайт
}

function startHearts() {
    const emojis = ['❤️', '💖', '💘', '💕', '😘'];
    setInterval(() => {
        const heart = document.createElement('span');
        heart.className = 'heart';
        heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        heart.style.left = Math.random() * 95 + 'vw';
        heart.style.fontSize = (1.5 + Math.random() * 2) + 'em';
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 4000);
    }, 300);
}
