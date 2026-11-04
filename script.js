const setupScreen = document.getElementById('setup-screen');
const timerScreen = document.getElementById('timer-screen');
const timeInput = document.getElementById('time-input');
const startBtn = document.getElementById('start-btn');
const hourglassWrapper = document.getElementById('hourglass-wrapper');
const hourglass = document.getElementById('hourglass');
const topSand = document.querySelector('.top-sand');
const bottomSand = document.querySelector('.bottom-sand');
const timeLeftDisplay = document.getElementById('time-left');
const feedback = document.getElementById('feedback');

let totalTime = 0;
let timeRemaining = 0;
let countdownInterval;
let isAnimatingFlip = false;

// Evento: Iniciar Ampulheta
startBtn.addEventListener('click', () => {
    let val = parseInt(timeInput.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 60) val = 60; // Trava regra de negócio de 60s máx
    
    totalTime = val;
    
    setupScreen.classList.add('hidden');
    timerScreen.classList.remove('hidden');
    
    startTimer();
});

// Evento: Toque/Clique na ampulheta
hourglassWrapper.addEventListener('click', () => {
    if (isAnimatingFlip) return; // Evita cliques duplos durante a animação
    flipAndRestart();
});

function startTimer() {
    clearInterval(countdownInterval);
    timeRemaining = totalTime;
    updateDisplay();
    feedback.classList.add('hidden');
    
    // 1. Zera o estado das animações CSS de forma imediata (sem transição)
    topSand.style.transition = 'none';
    bottomSand.style.transition = 'none';
    topSand.style.transform = 'scaleY(1)'; // Topo cheio
    bottomSand.style.transform = 'scaleY(0)'; // Base vazia
    
    // 2. Força o reflow do DOM para aplicar o reset imediatamente
    void topSand.offsetWidth;
    
    // 3. Aplica a transição com base no tempo escolhido
    topSand.style.transition = `transform ${totalTime}s linear`;
    bottomSand.style.transition = `transform ${totalTime}s linear`;
    
    // 4. Aciona a movimentação da areia
    topSand.style.transform = 'scaleY(0)'; // Topo esvazia
    bottomSand.style.transform = 'scaleY(1)'; // Base enche

    // 5. Inicia o contador digital numérico
    countdownInterval = setInterval(() => {
        timeRemaining--;
        updateDisplay();
        
        if (timeRemaining <= 0) {
            clearInterval(countdownInterval);
            feedback.classList.remove('hidden'); // Exibe animação de fim de tempo
        }
    }, 1000);
}

function flipAndRestart() {
    isAnimatingFlip = true;
    clearInterval(countdownInterval);
    feedback.classList.add('hidden');
    
    // Gira a ampulheta visualmente 180 graus
    hourglass.style.transition = 'transform 0.6s ease-in-out';
    hourglass.style.transform = 'rotate(180deg)';
    
    setTimeout(() => {
        // Truque visual: após o giro de 0.6s, tira a transição e reseta a rotação para 0deg.
        // Como a ampulheta é simétrica, o usuário não percebe a troca instantânea do layout.
        hourglass.style.transition = 'none';
        hourglass.style.transform = 'rotate(0deg)';
        
        // Reinicia os fluxos e o cronômetro visual
        startTimer();
        isAnimatingFlip = false;
    }, 600);
}

function updateDisplay() {
    const secs = timeRemaining.toString().padStart(2, '0');
    timeLeftDisplay.textContent = `00:${secs}`;
}