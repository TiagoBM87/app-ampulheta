/* ============================================================
   Elementos
   ============================================================ */
const root = document.documentElement;

const setupScreen = document.getElementById('setup-screen');
const timerScreen = document.getElementById('timer-screen');
const timeInput = document.getElementById('time-input');
const unitSelect = document.getElementById('unit-select');
const presetButtons = document.querySelectorAll('.preset-btn');
const startBtn = document.getElementById('start-btn');
const backBtn = document.getElementById('back-btn');

const hourglassWrapper = document.getElementById('hourglass-wrapper');
const hourglass = document.getElementById('hourglass');
const topSand = document.querySelector('.top-sand');
const bottomSand = document.querySelector('.bottom-sand');
const timeLeftDisplay = document.getElementById('time-left');
const feedback = document.getElementById('feedback');

const themeToggle = document.getElementById('theme-toggle');
const soundToggle = document.getElementById('sound-toggle');
const countToggle = document.getElementById('count-toggle');
const autoToggle = document.getElementById('auto-toggle');
const restartBtn = document.getElementById('restart-btn');

/* ============================================================
   Estado
   ============================================================ */
let totalTime = 0;        // em segundos
let timeRemaining = 0;    // em segundos
let endTime = 0;          // timestamp do fim
let countdownInterval = null;
let isAnimatingFlip = false;
let isPaused = false;
let pausedRemainingMs = 0;
let soundEnabled = true;
let countVisible = true;
let autoRestart = false;
let autoRestartTimeout = null;
let audioCtx = null;

const MAX_UNITS = 60; // 60 segundos ou 60 minutos

/* ============================================================
   Preferências (tema e som)
   ============================================================ */
function readPref(key) {
    try {
        return localStorage.getItem(key);
    } catch (e) {
        return null;
    }
}

function writePref(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (e) { /* localStorage indisponível */ }
}

function updateThemeColor() {
    const meta = document.getElementById('theme-color-meta');
    if (!meta) return;
    meta.setAttribute('content', root.dataset.theme === 'light' ? '#f5f1e8' : '#0f1115');
}

function initPreferences() {
    const savedTheme = readPref('ampulheta:theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
        root.dataset.theme = savedTheme;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        root.dataset.theme = 'light';
    }
    updateThemeColor();

    if (readPref('ampulheta:sound') === 'off') {
        soundEnabled = false;
    }
    updateSoundButton();

    if (readPref('ampulheta:count') === 'hidden') {
        countVisible = false;
    }
    updateCountButton();

    if (readPref('ampulheta:auto') === 'on') {
        autoRestart = true;
    }
    updateAutoButton();
}

themeToggle.addEventListener('click', () => {
    const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = nextTheme;
    writePref('ampulheta:theme', nextTheme);
    updateThemeColor();
});

function updateSoundButton() {
    soundToggle.classList.toggle('is-muted', !soundEnabled);
    soundToggle.setAttribute('aria-pressed', String(soundEnabled));
    soundToggle.setAttribute('aria-label', soundEnabled ? 'Desativar som' : 'Ativar som');
    soundToggle.title = soundEnabled ? 'Som ativado' : 'Som desativado';
}

soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    writePref('ampulheta:sound', soundEnabled ? 'on' : 'off');
    updateSoundButton();

    if (soundEnabled) {
        // Pequeno feedback sonoro ao reativar o som.
        playBeep(880, 0.12);
    }
});

function updateCountButton() {
    countToggle.classList.toggle('is-off', !countVisible);
    countToggle.setAttribute('aria-pressed', String(countVisible));
    countToggle.setAttribute('aria-label', countVisible ? 'Ocultar contagem numérica' : 'Mostrar contagem numérica');
    countToggle.title = countVisible ? 'Contagem visível' : 'Contagem oculta';

    if (countVisible) {
        delete root.dataset.count;
    } else {
        root.dataset.count = 'hidden';
    }
}

countToggle.addEventListener('click', () => {
    countVisible = !countVisible;
    writePref('ampulheta:count', countVisible ? 'visible' : 'hidden');
    updateCountButton();
});

function updateAutoButton() {
    autoToggle.classList.toggle('is-on', autoRestart);
    autoToggle.setAttribute('aria-pressed', String(autoRestart));
    autoToggle.setAttribute('aria-label', autoRestart ? 'Desativar reinício automático' : 'Ativar reinício automático');
    autoToggle.title = autoRestart ? 'Reinício automático ativado' : 'Reinício automático desativado';
}

function clearAutoRestart() {
    if (autoRestartTimeout !== null) {
        clearTimeout(autoRestartTimeout);
        autoRestartTimeout = null;
    }
}

autoToggle.addEventListener('click', () => {
    autoRestart = !autoRestart;
    writePref('ampulheta:auto', autoRestart ? 'on' : 'off');
    updateAutoButton();

    if (!autoRestart) {
        clearAutoRestart();
    }
});

restartBtn.addEventListener('click', () => {
    if (timerScreen.classList.contains('hidden')) return;
    restartCount();
});

/* ============================================================
   Áudio (Web Audio API — sem arquivos externos)
   ============================================================ */
function getAudioContext() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return null;
        audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playBeep(freq = 880, duration = 0.18, delay = 0) {
    if (!soundEnabled) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    const start = ctx.currentTime + delay;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, start);

    // Envelope suave para evitar "clique" no início/fim.
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.28, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
}

function playAlarm() {
    playBeep(880, 0.22, 0);
    playBeep(1100, 0.22, 0.3);
    playBeep(1320, 0.32, 0.6);
}

function vibrateAlarm() {
    if (typeof navigator.vibrate === 'function') {
        navigator.vibrate([220, 120, 220]);
    }
}

/* ============================================================
   Notificação do navegador
   ============================================================ */
function requestNotificationPermission() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
    }
}

function showNotification() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    try {
        const notification = new Notification('Tempo esgotado! ⏳', {
            body: `Seu timer de ${formatDuration(totalTime)} terminou.`,
            tag: 'ampulheta'
        });
        setTimeout(() => notification.close(), 8000);
    } catch (e) { /* alguns navegadores bloqueiam em file:// */ }
}

/* ============================================================
   Formatação
   ============================================================ */
function formatClock(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatDuration(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes === 0) return `${seconds}s`;
    if (seconds === 0) return `${minutes} min`;
    return `${minutes} min ${seconds}s`;
}

/* ============================================================
   Presets e unidade
   ============================================================ */
function unitMultiplier() {
    return unitSelect.value === 'min' ? 60 : 1;
}

function currentSelectionInSeconds() {
    const value = parseInt(timeInput.value, 10);
    if (Number.isNaN(value) || value < 1) return null;
    return value * unitMultiplier();
}

function syncPresetSelection() {
    const seconds = currentSelectionInSeconds();
    presetButtons.forEach((button) => {
        button.classList.toggle('is-active', Number(button.dataset.seconds) === seconds);
    });
}

function applyPreset(seconds) {
    if (seconds >= 60 && seconds % 60 === 0) {
        unitSelect.value = 'min';
        timeInput.value = seconds / 60;
    } else {
        unitSelect.value = 'sec';
        timeInput.value = seconds;
    }
    syncPresetSelection();
}

presetButtons.forEach((button) => {
    button.addEventListener('click', () => {
        applyPreset(Number(button.dataset.seconds));
    });
});

timeInput.addEventListener('input', syncPresetSelection);
unitSelect.addEventListener('change', syncPresetSelection);

/* ============================================================
   Início e navegação
   ============================================================ */
startBtn.addEventListener('click', () => {
    let value = parseInt(timeInput.value, 10);
    if (Number.isNaN(value) || value < 1) value = 1;
    if (value > MAX_UNITS) value = MAX_UNITS;

    timeInput.value = value;
    totalTime = value * unitMultiplier();
    clearAutoRestart();

    // Desbloqueia o áudio dentro do gesto do usuário.
    getAudioContext();
    requestNotificationPermission();

    setupScreen.classList.add('hidden');
    timerScreen.classList.remove('hidden');

    startTimer();
});

backBtn.addEventListener('click', () => {
    clearAutoRestart();
    stopCountdown();
    isPaused = false;
    pausedRemainingMs = 0;
    resetHourglassRotation();
    feedback.classList.add('hidden');
    hourglass.classList.remove('running');
    timerScreen.classList.add('hidden');
    setupScreen.classList.remove('hidden');
});

function stopCountdown() {
    if (countdownInterval !== null) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

/* ============================================================
   Lógica do timer
   ============================================================ */
function resetSandInstant() {
    // Zera o estado das animações CSS de forma imediata (sem transição).
    topSand.style.transition = 'none';
    bottomSand.style.transition = 'none';
    topSand.style.transform = 'scaleY(1)'; // Topo cheio (100%)
    bottomSand.style.transform = 'scaleY(0)'; // Base vazia (0%)

    // Força o recálculo de estilo para o reset valer antes da animação.
    // (Elementos SVG não têm offsetWidth; getBoundingClientRect cumpre o papel.)
    void topSand.getBoundingClientRect();
}

function startTimer() {
    stopCountdown();
    resetHourglassRotation();

    isPaused = false;
    pausedRemainingMs = 0;
    timeRemaining = totalTime;
    endTime = Date.now() + totalTime * 1000;
    updateDisplay();
    feedback.classList.add('hidden');
    hourglass.classList.add('running');

    resetSandInstant();

    // Aplica a transição com base no tempo escolhido.
    topSand.style.transition = `transform ${totalTime}s linear`;
    bottomSand.style.transition = `transform ${totalTime}s linear`;

    // Aciona a movimentação da areia. As duas partes usam a mesma duração e a
    // mesma curva linear, então a proporção é sempre complementar:
    // topo 100%/base 0% → 60%/40% → 50%/50% → 30%/70% → 0%/100%.
    topSand.style.transform = 'scaleY(0)'; // Topo esvazia
    bottomSand.style.transform = 'scaleY(1)'; // Base enche

    // Inicia o contador com base no relógio real (evita atraso acumulado).
    countdownInterval = setInterval(tick, 200);
}

function tick() {
    const remainingMs = endTime - Date.now();
    const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

    if (remainingSeconds !== timeRemaining) {
        timeRemaining = remainingSeconds;
        updateDisplay();
    }

    if (remainingMs <= 0) {
        finishTimer();
    }
}

function finishTimer() {
    stopCountdown();
    isPaused = false;
    pausedRemainingMs = 0;
    timeRemaining = 0;
    updateDisplay();

    // Garante o estado final exato: topo vazio (0%) e vidro inferior cheio (100%).
    topSand.style.transition = 'none';
    topSand.style.transform = 'scaleY(0)';
    bottomSand.style.transition = 'none';
    bottomSand.style.transform = 'scaleY(1)';
    resetHourglassRotation();

    hourglass.classList.remove('running');
    feedback.classList.remove('hidden');

    playAlarm();
    vibrateAlarm();
    showNotification();

    // Reinício automático: dá tempo de ver o aviso e ouvir o alarme.
    clearAutoRestart();
    if (autoRestart) {
        autoRestartTimeout = setTimeout(() => {
            autoRestartTimeout = null;
            if (autoRestart && !timerScreen.classList.contains('hidden')) {
                flipAndRestart();
            }
        }, 1200);
    }
}

function updateDisplay() {
    timeLeftDisplay.textContent = formatClock(timeRemaining);
}

/* ============================================================
   Pausar e retomar
   ============================================================ */
function currentScaleY(element) {
    const transform = getComputedStyle(element).transform;
    if (!transform || transform === 'none') return 1;

    const match = transform.match(/matrix\(([^)]+)\)/);
    if (!match) return 1;

    const values = match[1].split(',').map(Number);
    return values.length === 6 ? values[3] : 1;
}

function freezeSand() {
    // Congela as duas partes exatamente no ponto em que a animação estava.
    const topScale = currentScaleY(topSand);
    const bottomScale = currentScaleY(bottomSand);

    topSand.style.transition = 'none';
    bottomSand.style.transition = 'none';
    topSand.style.transform = `scaleY(${topScale})`;
    bottomSand.style.transform = `scaleY(${bottomScale})`;

    // Força o recálculo para que a retomada parta do estado congelado.
    void topSand.getBoundingClientRect();
    void bottomSand.getBoundingClientRect();
}

const TILT_EASING = 'cubic-bezier(0.45, 0.05, 0.35, 1)';
const TILT_DURATION = '0.5s';

function tiltHourglassForPause() {
    hourglass.style.transition = `transform ${TILT_DURATION} ${TILT_EASING}`;
    hourglass.style.transform = 'rotate(90deg)';
}

function restoreHourglassRotation() {
    hourglass.style.transition = `transform ${TILT_DURATION} ${TILT_EASING}`;
    hourglass.style.transform = 'rotate(0deg)';
}

function resetHourglassRotation() {
    hourglass.style.transition = 'none';
    hourglass.style.transform = 'rotate(0deg)';
}

function pauseTimer() {
    const remainingMs = Math.max(0, endTime - Date.now());

    if (remainingMs <= 0) {
        finishTimer();
        return;
    }

    pausedRemainingMs = remainingMs;
    timeRemaining = Math.ceil(remainingMs / 1000);
    updateDisplay();
    stopCountdown();
    freezeSand();
    tiltHourglassForPause();
    hourglass.classList.remove('running');
    isPaused = true;
}

function resumeTimer() {
    if (!isPaused) return;

    const remainingMs = pausedRemainingMs;
    if (remainingMs <= 0) {
        finishTimer();
        return;
    }

    isPaused = false;
    pausedRemainingMs = 0;
    endTime = Date.now() + remainingMs;
    restoreHourglassRotation();

    // Retoma a areia a partir do ponto congelado, com a duração restante.
    const duration = remainingMs / 1000;
    topSand.style.transition = `transform ${duration}s linear`;
    bottomSand.style.transition = `transform ${duration}s linear`;

    void topSand.getBoundingClientRect();
    void bottomSand.getBoundingClientRect();

    topSand.style.transform = 'scaleY(0)';
    bottomSand.style.transform = 'scaleY(1)';

    hourglass.classList.add('running');
    stopCountdown();
    countdownInterval = setInterval(tick, 200);
}

/* ============================================================
   Virar a ampulheta
   ============================================================ */
function flipAndRestart() {
    clearAutoRestart();
    isAnimatingFlip = true;
    stopCountdown();
    feedback.classList.add('hidden');
    hourglass.classList.remove('running');

    // Gira a ampulheta 180°. O desenho é simétrico, então ao final basta
    // voltar a rotação para 0° enquanto a areia é reiniciada.
    hourglass.style.transition = 'transform 0.6s cubic-bezier(0.45, 0.05, 0.35, 1)';
    hourglass.style.transform = 'rotate(180deg)';

    setTimeout(() => {
        // Se o usuário voltou para a configuração durante o giro, não reinicia.
        if (timerScreen.classList.contains('hidden')) {
            isAnimatingFlip = false;
            return;
        }

        // Truque visual: como a ampulheta é simétrica, a troca instantânea
        // de 180° para 0° não é percebida pelo usuário.
        hourglass.style.transition = 'none';
        hourglass.style.transform = 'rotate(0deg)';

        // Reinicia os fluxos e o cronômetro visual.
        startTimer();
        isAnimatingFlip = false;
    }, 600);
}

/* ============================================================
    Reiniciar contagem (volta para posição inicial)
    ============================================================ */
function restartCount() {
    // Para qualquer contagem ativa, reinicia a ampulheta para o estado inicial
    // com os mesmos valores configurados originalmente (totalTime, unitSelect, etc.)
    clearAutoRestart();
    stopCountdown();
    isPaused = false;
    pausedRemainingMs = 0;
    timeRemaining = totalTime;
    endTime = Date.now() + totalTime * 1000;
    resetHourglassRotation();
    feedback.classList.add('hidden');
    hourglass.classList.remove('running');

    // Reset instantâneo da areia para o estado inicial (topo cheio, base vazia)
    resetSandInstant();

    // Aplica a transição com base no tempo escolhido (mesmo que startTimer)
    topSand.style.transition = `transform ${totalTime}s linear`;
    bottomSand.style.transition = `transform ${totalTime}s linear`;

    // Inicia a movimentação da areia: topo esvazia, base enche
    topSand.style.transform = 'scaleY(0)'; // Topo esvazia
    bottomSand.style.transform = 'scaleY(1)'; // Base enche

    // Inicia o contador com base no relógio real
    countdownInterval = setInterval(tick, 200);
    updateDisplay();
    hourglass.classList.add('running');
}

function handleHourglassActivation() {
    if (isAnimatingFlip || timerScreen.classList.contains('hidden')) return;

    // Em andamento: pausa o tempo e congela a areia.
    if (hourglass.classList.contains('running')) {
        pauseTimer();
        return;
    }

    // Pausado no meio da contagem: retoma de onde parou.
    if (isPaused) {
        resumeTimer();
        return;
    }

    // Tempo esgotado (ou ainda não iniciado): gira e reinicia a contagem.
    // Isso cobre o caso em que o reinício automático está desligado.
    flipAndRestart();
}

hourglassWrapper.addEventListener('click', handleHourglassActivation);

hourglassWrapper.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleHourglassActivation();
    }
});

/* ============================================================
   Service Worker (PWA)
   ============================================================ */
function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    // Service workers exigem contexto seguro: HTTPS ou localhost.
    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (location.protocol !== 'https:' && !isLocalhost) return;

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {
            /* Registro indisponível — o app continua funcionando online. */
        });
    });
}

/* ============================================================
   Inicialização
   ============================================================ */
initPreferences();
syncPresetSelection();
updateDisplay();
registerServiceWorker();
