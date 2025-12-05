// Variables del juego
let gameState = {
    mode: "solitario",
    numPlayers: 1,
    difficulty: "normal",
    numPairs: 10,
    cards: [],
    flippedCards: [],
    matchedCards: [],
    scores: [0],
    playerMovements: [0],
    currentPlayer: 0,
    playerNames: ["Jugador 1"],
    blocked: false,
    startTime: 0,
    movements: 0,
    // Modo vs computadora
    vsComputer: true,
    computerTurn: false,
    computerMemory: {},
    knownPair: null,
    firstFlippedCard: null,
    iaDifficulty: "normal",
    // Modo carrera
    timeRemaining: 60,
    selectedTime: 60,
    timerActive: false,
    timerInterval: null,
    // Estado de pausa
    gamePaused: false,
    pauseTime: 0
};

// Símbolos para las cartas (20 cartas = 10 pares)
const symbols = ["🚀", "⭐", "🎯", "🎮", "🎨", "🎵", "🎭", "🏆", "🎪", "🎲", "🎳", "🎸", "🎹", "🎷", "🎺", "🥁", "📱", "💻", "🕹️", "🎲"];

// Inicialización del juego
document.addEventListener('DOMContentLoaded', function() {
    // Prevenir zoom en dispositivos móviles
    document.addEventListener('gesturestart', function(e) {
        e.preventDefault();
    });
    
    // Prevenir acciones del navegador en móviles
    document.addEventListener('touchmove', function(e) {
        if (e.scale !== 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    startWelcomeAnimation();
});

// Animación de bienvenida
function startWelcomeAnimation() {
    const title = document.getElementById('welcome-title');
    const subtitle = document.getElementById('welcome-subtitle');
    const progress = document.getElementById('progress-inner');
    const loadingText = document.getElementById('loading-text');
    
    let progressValue = 0;
    const progressInterval = setInterval(() => {
        progressValue += 2;
        progress.style.width = `${progressValue}%`;
        
        if (progressValue <= 25) {
            loadingText.textContent = "Cargando assets...";
        } else if (progressValue <= 50) {
            loadingText.textContent = "Inicializando motor gráfico...";
        } else if (progressValue <= 75) {
            loadingText.textContent = "Preparando experiencia...";
        } else {
            loadingText.textContent = "¡Listo!";
        }
        
        if (progressValue >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => {
                showScreen('main-menu');
            }, 500);
        }
    }, 50);
    
    // Animación de escritura del título
    typeText(title, "NEURO-MATCH 2025", 50, () => {
        // Animación de escritura del subtítulo
        typeText(subtitle, "ENTRENA TU MENTE • SUPERA TUS LÍMITES", 30);
    });
}

// Efecto de escritura de texto
function typeText(element, text, speed, callback) {
    let i = 0;
    element.textContent = "";
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else if (callback) {
            callback();
        }
    }
    
    type();
}

// Cambiar pantalla visible
function showScreen(screenId) {
    // Detener cualquier temporizador activo antes de cambiar de pantalla
    if (screenId !== 'game-screen' && screenId !== 'pause-screen') {
        stopTimer();
        resetGameState();
    }
    
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    
    // Vibrar en móviles al cambiar pantalla
    if ('vibrate' in navigator) {
        navigator.vibrate(10);
    }
}

// NUEVA FUNCIÓN: Reiniciar completamente el estado del juego
function resetGameState() {
    gameState.cards = [];
    gameState.flippedCards = [];
    gameState.matchedCards = [];
    gameState.blocked = false;
    gameState.movements = 0;
    gameState.startTime = 0;
    gameState.currentPlayer = 0;
    gameState.computerMemory = {};
    gameState.computerTurn = false;
    gameState.knownPair = null;
    gameState.firstFlippedCard = null;
    gameState.gamePaused = false;
    gameState.pauseTime = 0;
    gameState.timerActive = false;
    
    // Detener cualquier intervalo activo
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

// Configurar modo de juego
function setGameMode(mode) {
    // Reiniciar estado antes de cambiar de modo
    resetGameState();
    
    gameState.mode = mode;
    
    if (mode === "solitario") {
        showScreen('ia-difficulty-screen');
    } else if (mode === "multijugador") {
        showScreen('players-screen');
    } else if (mode === "carrera") {
        showScreen('time-screen');
    }
}

// Configurar dificultad de IA
function setIADifficulty(difficulty) {
    gameState.iaDifficulty = difficulty;
    gameState.vsComputer = true;
    gameState.numPlayers = 2;
    gameState.playerNames = ["Jugador 1", "Computadora"];
    gameState.scores = [0, 0];
    gameState.playerMovements = [0, 0];
    gameState.computerTurn = false;
    
    // SIEMPRE 10 PARES (4x5 grid) para todas las dificultades
    gameState.numPairs = 10;
    
    startGame();
}

// Configurar número de jugadores
function setPlayers(num) {
    gameState.vsComputer = false;
    gameState.numPlayers = num;
    gameState.playerNames = [];
    for (let i = 0; i < num; i++) {
        gameState.playerNames.push(`Jugador ${i+1}`);
    }
    gameState.scores = new Array(num).fill(0);
    gameState.playerMovements = new Array(num).fill(0);
    
    // SIEMPRE 10 PARES (4x5 grid)
    gameState.numPairs = 10;
    
    startGame();
}

// Configurar tiempo para modo carrera
function setTime(time) {
    gameState.selectedTime = time;
    gameState.vsComputer = false;
    gameState.numPlayers = 1;
    gameState.playerNames = ["Jugador 1"];
    gameState.scores = [0];
    gameState.playerMovements = [0];
    // SIEMPRE 10 PARES (4x5 grid) para modo carrera
    gameState.numPairs = 10;
    
    startGame();
}

// Iniciar juego
function startGame() {
    initializeGame();
    showScreen('game-screen');
    updateGameUI();
    
    // Mostrar toast informativo
    showToast(`Modo: ${gameState.mode.toUpperCase()}`);
    
    // Iniciar cronómetro si es modo carrera
    if (gameState.mode === "carrera") {
        startTimer();
    }
}

// Inicializar estado del juego
function initializeGame() {
    // Limpiar estado previo
    gameState.cards = [];
    gameState.flippedCards = [];
    gameState.matchedCards = [];
    gameState.blocked = false;
    gameState.movements = 0;
    gameState.startTime = Date.now();
    gameState.currentPlayer = 0;
    gameState.computerMemory = {};
    gameState.computerTurn = false;
    gameState.gamePaused = false;
    
    // Reiniciar puntuaciones según el modo
    if (gameState.mode === "carrera") {
        gameState.scores = [0];
        gameState.playerMovements = [0];
        gameState.timeRemaining = gameState.selectedTime;
    } else if (gameState.mode === "solitario") {
        // Siempre contra computadora
        gameState.scores = [0, 0];
        gameState.playerMovements = [0, 0];
        gameState.computerTurn = false;
        gameState.computerMemory = {};
        gameState.knownPair = null;
        gameState.firstFlippedCard = null;
    }
    
    // Crear pares de cartas
    const gameSymbols = generateSymbols();
    gameState.cards = [...gameSymbols, ...gameSymbols];
    shuffleArray(gameState.cards);
    
    // Crear tablero de juego
    createGameBoard();
}

// Generar símbolos para las cartas
function generateSymbols() {
    if (gameState.numPairs <= symbols.length) {
        return symbols.slice(0, gameState.numPairs);
    } else {
        // Si necesitamos más símbolos, duplicamos algunos
        return Array.from({length: gameState.numPairs}, (_, i) => symbols[i % symbols.length]);
    }
}

// Barajar array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Crear tablero de juego
function createGameBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    
    // SIEMPRE 4 COLUMNAS Y 5 FILAS
    gameBoard.style.gridTemplateColumns = `repeat(4, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(5, 1fr)`;
    
    // Crear cartas (20 cartas = 10 pares)
    for (let i = 0; i < gameState.cards.length; i++) {
        const card = document.createElement('div');
        card.className = 'card';
        card.textContent = '?';
        card.dataset.index = i;
        card.dataset.symbol = gameState.cards[i];
        
        // Usar evento touch para móviles
        card.addEventListener('touchstart', (e) => {
            e.preventDefault();
            flipCard(i);
        });
        
        // También mantener compatibilidad con click
        card.addEventListener('click', () => flipCard(i));
        
        gameBoard.appendChild(card);
    }
    
    // Actualizar puntuaciones
    updateScoresUI();
    updateStatsUI();
}

// Voltear carta - FUNCIÓN CORREGIDA
function flipCard(index) {
    if (gameState.blocked || 
        gameState.flippedCards.includes(index) || 
        gameState.matchedCards.includes(index) ||
        (gameState.mode === "solitario" && gameState.computerTurn) ||
        gameState.gamePaused) {
        return;
    }
    
    playSound("flip");
    
    // Vibrar al voltear carta
    if ('vibrate' in navigator) {
        navigator.vibrate(5);
    }
    
    // Voltear carta - MOSTRAR EL SÍMBOLO CORRECTAMENTE
    const cardElement = document.querySelector(`.card[data-index="${index}"]`);
    cardElement.textContent = gameState.cards[index]; // Esto muestra el símbolo
    cardElement.classList.add('flipped');
    
    gameState.flippedCards.push(index);
    
    // Verificar si tenemos un par
    if (gameState.flippedCards.length === 2) {
        gameState.movements++;
        if (gameState.numPlayers > 1) {
            gameState.playerMovements[gameState.currentPlayer]++;
        }
        
        updateStatsUI();
        checkPair();
    } else if (gameState.mode === "solitario" && !gameState.computerTurn) {
        // Turno de la computadora después del jugador
        setTimeout(() => {
            computerTurn();
        }, 800);
    }
}

// Verificar par
function checkPair() {
    gameState.blocked = true;
    
    const [idx1, idx2] = gameState.flippedCards;
    
    if (gameState.cards[idx1] === gameState.cards[idx2]) {
        // Par encontrado
        playSound("match");
        gameState.matchedCards.push(idx1, idx2);
        
        // Actualizar puntuación
        gameState.scores[gameState.currentPlayer]++;
        
        // Efecto visual de acierto
        animateMatch(idx1, idx2);
        
        // Verificar si el juego ha terminado
        if (gameState.matchedCards.length === gameState.cards.length) {
            setTimeout(() => {
                finishGame();
            }, 800);
        } else {
            gameState.flippedCards = [];
            gameState.blocked = false;
            
            // En solitario contra IA, el jugador sigue si acierta
            if (gameState.mode === "solitario") {
                // El jugador sigue jugando
                showToast("¡Bien! Sigue tu turno");
            } else if (gameState.numPlayers > 1) {
                nextPlayer();
            }
        }
    } else {
        // No es par
        playSound("error");
        setTimeout(() => {
            hideCards();
        }, 800);
    }
}

// Animación cuando se encuentra un par
function animateMatch(idx1, idx2) {
    const card1 = document.querySelector(`.card[data-index="${idx1}"]`);
    const card2 = document.querySelector(`.card[data-index="${idx2}"]`);
    
    card1.classList.add('matched');
    card2.classList.add('matched');
    
    // Efecto de partículas visual
    createParticles(card1);
    createParticles(card2);
}

// Crear efecto de partículas
function createParticles(element) {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '6px';
        particle.style.height = '6px';
        particle.style.background = getRandomColor();
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';
        
        document.body.appendChild(particle);
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 50;
        const duration = 500 + Math.random() * 500;
        
        particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`, opacity: 0 }
        ], {
            duration: duration,
            easing: 'ease-out'
        }).onfinish = () => {
            particle.remove();
        };
    }
}

function getRandomColor() {
    const colors = [
        '#00ff9d', '#0072ce', '#ff2a6d', '#ff8a00', '#b967ff'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Ocultar cartas que no forman par
function hideCards() {
    gameState.flippedCards.forEach(idx => {
        if (!gameState.matchedCards.includes(idx)) {
            const card = document.querySelector(`.card[data-index="${idx}"]`);
            card.textContent = '?';
            card.classList.remove('flipped');
        }
    });
    
    gameState.flippedCards = [];
    gameState.blocked = false;
    
    // Cambiar al siguiente jugador en multijugador
    if (gameState.numPlayers > 1 && gameState.mode !== "solitario") {
        nextPlayer();
    } else if (gameState.mode === "solitario") {
        // Cambiar al turno de la computadora
        gameState.computerTurn = true;
        showToast("Turno de la computadora");
        setTimeout(() => {
            computerTurn();
        }, 500);
    }
}

// Siguiente jugador
function nextPlayer() {
    gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.numPlayers;
    showToast(`Turno de ${gameState.playerNames[gameState.currentPlayer]}`);
    updateGameUI();
}

// Actualizar UI del juego
function updateGameUI() {
    let playerText = `Turno: ${gameState.playerNames[gameState.currentPlayer]}`;
    
    if (gameState.mode === "solitario" && gameState.computerTurn) {
        playerText += ` (${gameState.iaDifficulty})`;
    }
    
    document.getElementById('current-player').textContent = playerText;
    
    // Actualizar puntuaciones
    updateScoresUI();
    updateStatsUI();
}

// Actualizar UI de puntuaciones
function updateScoresUI() {
    const scoresContainer = document.getElementById('scores-container');
    scoresContainer.innerHTML = '';
    
    for (let i = 0; i < gameState.numPlayers; i++) {
        const scoreElement = document.createElement('div');
        scoreElement.className = `score ${i === gameState.currentPlayer ? 'active' : ''}`;
        scoreElement.textContent = `${gameState.playerNames[i]}: ${gameState.scores[i]}`;
        scoresContainer.appendChild(scoreElement);
    }
}

// Actualizar estadísticas
function updateStatsUI() {
    document.getElementById('movements-count').textContent = gameState.movements;
    document.getElementById('pairs-count').textContent = 
        `${gameState.matchedCards.length / 2}/${gameState.numPairs}`;
}

// Turno de la computadora
function computerTurn() {
    if (!gameState.computerTurn || gameState.blocked || gameState.mode !== "solitario" || gameState.gamePaused) {
        return;
    }
    
    // Mostrar indicador de turno de IA
    document.getElementById('current-player').classList.add('computer-turn');
    showToast(`IA (${gameState.iaDifficulty}) pensando...`);
    
    // Estrategia según dificultad
    setTimeout(() => {
        if (gameState.iaDifficulty === "fácil") {
            easyAI();
        } else if (gameState.iaDifficulty === "normal") {
            normalAI();
        } else if (gameState.iaDifficulty === "difícil") {
            hardAI();
        } else { // imposible
            impossibleAI();
        }
    }, 1000);
}

// IA fácil: elección aleatoria con errores
function easyAI() {
    const available = getAvailableCards();
    
    if (available.length >= 2) {
        // Elegir dos cartas aleatorias con 30% de probabilidad de error
        const [card1, card2] = getRandomCards(available, 2);
        
        // 30% de probabilidad de elegir mal a propósito
        if (Math.random() < 0.3 && available.length > 4) {
            // Buscar una carta que no haga par
            let wrongCard;
            do {
                wrongCard = available[Math.floor(Math.random() * available.length)];
            } while (gameState.cards[wrongCard] === gameState.cards[card1] || wrongCard === card1);
            
            flipComputerCards(card1, wrongCard);
        } else {
            flipComputerCards(card1, card2);
        }
    }
}

// IA normal: memoria básica
function normalAI() {
    const available = getAvailableCards();
    
    // Buscar pares conocidos en memoria
    for (let symbol in gameState.computerMemory) {
        const positions = gameState.computerMemory[symbol];
        if (positions.length === 2 && 
            available.includes(positions[0]) && 
            available.includes(positions[1])) {
            flipComputerCards(positions[0], positions[1]);
            return;
        }
    }
    
    // Si no encuentra pares, comportamiento aleatorio con memoria
    if (available.length >= 2) {
        const [card1, card2] = getRandomCards(available, 2);
        
        // Recordar estas cartas
        if (!gameState.computerMemory[gameState.cards[card1]]) {
            gameState.computerMemory[gameState.cards[card1]] = [card1];
        } else if (!gameState.computerMemory[gameState.cards[card1]].includes(card1)) {
            gameState.computerMemory[gameState.cards[card1]].push(card1);
        }
        
        if (!gameState.computerMemory[gameState.cards[card2]]) {
            gameState.computerMemory[gameState.cards[card2]] = [card2];
        } else if (!gameState.computerMemory[gameState.cards[card2]].includes(card2)) {
            gameState.computerMemory[gameState.cards[card2]].push(card2);
        }
        
        flipComputerCards(card1, card2);
    }
}

// IA difícil: memoria avanzada
function hardAI() {
    const available = getAvailableCards();
    
    // Estrategia avanzada: buscar pares y recordar posiciones
    for (let i = 0; i < available.length; i++) {
        for (let j = i + 1; j < available.length; j++) {
            if (gameState.cards[available[i]] === gameState.cards[available[j]]) {
                // Verificar si al menos una está en memoria
                if (available[i] in gameState.computerMemory || available[j] in gameState.computerMemory) {
                    flipComputerCards(available[i], available[j]);
                    return;
                }
            }
        }
    }
    
    // Si no encuentra pares evidentes, usar memoria extendida
    const knownCards = Object.keys(gameState.computerMemory);
    if (knownCards.length > 0) {
        // Elegir una carta conocida y buscar su par
        const randomSymbol = knownCards[Math.floor(Math.random() * knownCards.length)];
        const knownPositions = gameState.computerMemory[randomSymbol];
        
        if (knownPositions.length === 1) {
            // Buscar el par de esta carta
            const knownCard = knownPositions[0];
            for (let i = 0; i < available.length; i++) {
                if (available[i] !== knownCard && gameState.cards[available[i]] === randomSymbol) {
                    flipComputerCards(knownCard, available[i]);
                    return;
                }
            }
        }
    }
    
    // Fallback a comportamiento normal
    normalAI();
}

// IA imposible: memoria perfecta
function impossibleAI() {
    const available = getAvailableCards();
    
    // Memoria perfecta - buscar todos los pares posibles
    const symbolMap = {};
    
    // Mapear todas las cartas disponibles por símbolo
    available.forEach(index => {
        const symbol = gameState.cards[index];
        if (!symbolMap[symbol]) {
            symbolMap[symbol] = [];
        }
        symbolMap[symbol].push(index);
    });
    
    // Buscar pares completos
    for (let symbol in symbolMap) {
        if (symbolMap[symbol].length >= 2) {
            flipComputerCards(symbolMap[symbol][0], symbolMap[symbol][1]);
            return;
        }
    }
    
    // Si no hay pares completos, usar estrategia de minimizar errores
    if (available.length >= 2) {
        const [card1, card2] = getSmartCards(available);
        flipComputerCards(card1, card2);
    }
}

function getSmartCards(available) {
    // Elegir cartas que minimicen la información revelada
    const unknownSymbols = new Set();
    const knownSymbols = new Set(Object.keys(gameState.computerMemory));
    
    available.forEach(index => {
        if (!knownSymbols.has(gameState.cards[index])) {
            unknownSymbols.add(gameState.cards[index]);
        }
    });
    
    // Preferir revelar símbolos ya conocidos
    if (knownSymbols.size > 0) {
        const knownArray = Array.from(knownSymbols);
        const symbol = knownArray[Math.floor(Math.random() * knownArray.length)];
        const positions = available.filter(index => gameState.cards[index] === symbol);
        if (positions.length >= 2) {
            return [positions[0], positions[1]];
        }
    }
    
    // Si no, elegir aleatoriamente
    return getRandomCards(available, 2);
}

// Obtener cartas disponibles
function getAvailableCards() {
    return Array.from({length: gameState.cards.length}, (_, i) => i)
        .filter(i => !gameState.flippedCards.includes(i) && !gameState.matchedCards.includes(i));
}

// Obtener cartas aleatorias
function getRandomCards(available, count) {
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Voltear cartas para la IA - FUNCIÓN CORREGIDA
function flipComputerCards(idx1, idx2) {
    playSound("flip");
    
    // Voltear primera carta - MOSTRAR SÍMBOLO
    const card1 = document.querySelector(`.card[data-index="${idx1}"]`);
    card1.textContent = gameState.cards[idx1]; // Mostrar símbolo
    card1.classList.add('flipped');
    gameState.flippedCards.push(idx1);
    
    // Voltear segunda carta después de una pausa - MOSTRAR SÍMBOLO
    setTimeout(() => {
        const card2 = document.querySelector(`.card[data-index="${idx2}"]`);
        card2.textContent = gameState.cards[idx2]; // Mostrar símbolo
        card2.classList.add('flipped');
        gameState.flippedCards.push(idx2);
        
        gameState.movements++;
        gameState.playerMovements[1]++;
        
        updateStatsUI();
        
        setTimeout(() => {
            checkComputerPair();
        }, 800);
    }, 600);
}

// Verificar par de la IA
function checkComputerPair() {
    const [idx1, idx2] = gameState.flippedCards;
    
    if (gameState.cards[idx1] === gameState.cards[idx2]) {
        playSound("match");
        gameState.matchedCards.push(idx1, idx2);
        gameState.scores[1]++;
        
        animateMatch(idx1, idx2);
        
        if (gameState.matchedCards.length === gameState.cards.length) {
            setTimeout(() => {
                finishGame();
            }, 800);
        } else {
            gameState.flippedCards = [];
            gameState.blocked = false;
            // La IA sigue jugando si acierta
            setTimeout(() => {
                computerTurn();
            }, 600);
        }
    } else {
        playSound("error");
        setTimeout(() => {
            hideComputerCards();
        }, 800);
    }
}

// Ocultar cartas de la IA
function hideComputerCards() {
    gameState.flippedCards.forEach(idx => {
        if (!gameState.matchedCards.includes(idx)) {
            const card = document.querySelector(`.card[data-index="${idx}"]`);
            card.textContent = '?';
            card.classList.remove('flipped');
        }
    });
    
    gameState.flippedCards = [];
    gameState.blocked = false;
    gameState.computerTurn = false;
    
    // Quitar indicador de turno de IA
    document.getElementById('current-player').classList.remove('computer-turn');
}

// Iniciar cronómetro para modo carrera
function startTimer() {
    gameState.timerActive = true;
    gameState.timeRemaining = gameState.selectedTime;
    updateTimerUI();
    
    gameState.timerInterval = setInterval(() => {
        if (!gameState.gamePaused && gameState.timerActive) {
            gameState.timeRemaining--;
            updateTimerUI();
            
            if (gameState.timeRemaining <= 0) {
                timeUp();
            }
        }
    }, 1000);
}

// Actualizar UI del cronómetro
function updateTimerUI() {
    const minutes = Math.floor(gameState.timeRemaining / 60);
    const seconds = gameState.timeRemaining % 60;
    
    let color = "var(--accent-green)";
    if (gameState.timeRemaining <= 10) {
        color = "var(--error)";
        // Vibrar cuando queda poco tiempo
        if (gameState.timeRemaining <= 5 && 'vibrate' in navigator) {
            navigator.vibrate(100);
        }
    } else if (gameState.timeRemaining <= 30) {
        color = "var(--warning)";
    }
    
    document.getElementById('time-display').textContent = 
        `⏰ ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('time-display').style.color = color;
}

// Detener cronómetro
function stopTimer() {
    gameState.timerActive = false;
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

// Tiempo agotado
function timeUp() {
    if (gameState.mode === "carrera" && gameState.timerActive) {
        stopTimer();
        playSound("lose");
        showLossScreen();
    }
}

// Finalizar juego
function finishGame() {
    stopTimer();
    const totalTime = (Date.now() - gameState.startTime) / 1000;
    
    if (gameState.mode === "carrera") {
        if (gameState.scores[0] === gameState.numPairs) {
            playSound("win");
            showVictoryScreen(totalTime);
        } else {
            playSound("lose");
            showLossScreen();
        }
    } else {
        playSound("win");
        showResultsScreen(totalTime);
    }
}

// Mostrar pantalla de victoria
function showVictoryScreen(totalTime) {
    document.getElementById('results-title').textContent = "🎉 VICTORIA 🎉";
    document.getElementById('results-title').style.color = "var(--accent-green)";
    document.getElementById('result-icon').textContent = "🏆";
    
    let statsHTML = `
        <div class="stat-line">
            <span>Tiempo:</span>
            <span>${totalTime.toFixed(1)} segundos</span>
        </div>
        <div class="stat-line">
            <span>Movimientos:</span>
            <span>${gameState.movements}</span>
        </div>
        <div class="stat-line">
            <span>Pares encontrados:</span>
            <span>${gameState.scores[0]}/${gameState.numPairs}</span>
        </div>
    `;
    
    document.getElementById('results-stats').innerHTML = statsHTML;
    showScreen('results-screen');
}

// Mostrar pantalla de derrota
function showLossScreen() {
    document.getElementById('results-title').textContent = "💀 TIEMPO AGOTADO 💀";
    document.getElementById('results-title').style.color = "var(--error)";
    document.getElementById('result-icon').textContent = "⏰";
    
    let statsHTML = `
        <div class="stat-line">
            <span>Pares encontrados:</span>
            <span>${gameState.scores[0]}/${gameState.numPairs}</span>
        </div>
        <div class="stat-line">
            <span>Movimientos:</span>
            <span>${gameState.movements}</span>
        </div>
    `;
    
    document.getElementById('results-stats').innerHTML = statsHTML;
    showScreen('results-screen');
}

// Mostrar pantalla de resultados
function showResultsScreen(totalTime) {
    // Determinar ganador
    let title, titleColor, icon;
    
    if (gameState.mode === "carrera") {
        title = "🎉 JUEGO COMPLETADO 🎉";
        titleColor = "var(--accent-green)";
        icon = "🏆";
    } else {
        const maxScore = Math.max(...gameState.scores);
        const winners = gameState.scores.map((score, i) => score === maxScore ? i : -1).filter(i => i !== -1);
        
        if (winners.length === 1) {
            if (gameState.mode === "solitario" && winners[0] === 1) {
                title = `🤖 IA (${gameState.iaDifficulty}) GANA 🤖`;
                titleColor = "var(--error)";
                icon = "🤖";
            } else {
                title = `🎉 ${gameState.playerNames[winners[0]].toUpperCase()} GANA 🎉`;
                titleColor = "var(--accent-green)";
                icon = "👑";
            }
        } else {
            title = "🤝 EMPATE 🤝";
            titleColor = "var(--accent-blue)";
            icon = "⚖️";
        }
    }
    
    document.getElementById('results-title').textContent = title;
    document.getElementById('results-title').style.color = titleColor;
    document.getElementById('result-icon').textContent = icon;
    
    let statsHTML = `
        <div class="stat-line">
            <span>Tiempo total:</span>
            <span>${totalTime.toFixed(1)} segundos</span>
        </div>
        <div class="stat-line">
            <span>Movimientos totales:</span>
            <span>${gameState.movements}</span>
        </div>
    `;
    
    // Mostrar dificultad en modo solitario
    if (gameState.mode === "solitario") {
        statsHTML += `
            <div class="stat-line">
                <span>Dificultad IA:</span>
                <span>${gameState.iaDifficulty.toUpperCase()}</span>
            </div>
        `;
    }
    
    statsHTML += `<br>`;
    
    for (let i = 0; i < gameState.numPlayers; i++) {
        let playerName = gameState.playerNames[i];
        if (gameState.mode === "solitario" && i === 1) {
            playerName += ` (${gameState.iaDifficulty})`;
        }
        
        statsHTML += `
            <div class="stat-line">
                <span>${playerName}:</span>
                <span>${gameState.scores[i]} pares (${gameState.playerMovements[i]} movimientos)</span>
            </div>
        `;
    }
    
    document.getElementById('results-stats').innerHTML = statsHTML;
    showScreen('results-screen');
}

// Pausar juego
function pauseGame() {
    gameState.gamePaused = true;
    if (gameState.timerActive) {
        gameState.pauseTime = Date.now();
    }
    showScreen('pause-screen');
}

// Reanudar juego
function resumeGame() {
    gameState.gamePaused = false;
    if (gameState.timerActive) {
        // Ajustar el tiempo restante basado en el tiempo de pausa
        const pauseDuration = (Date.now() - gameState.pauseTime) / 1000;
        // No necesitamos ajustar gameState.timeRemaining porque el intervalo se detuvo
    }
    showScreen('game-screen');
}

// Reiniciar juego
function restartGame() {
    stopTimer();
    gameState.gamePaused = false;
    
    if (gameState.mode === "carrera") {
        gameState.timeRemaining = gameState.selectedTime;
    }
    
    startGame();
}

// Mostrar toast
function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Mostrar información
function showInfo() {
    showToast("Neuro-Match 2025 - Desarrollado para móviles");
}

// Reproducir sonidos
function playSound(type) {
    // En una implementación real, aquí cargarías y reproducirías archivos de audio
    // Por simplicidad, solo simulamos la funcionalidad
    console.log(`Reproduciendo sonido: ${type}`);
}

// Prevenir acciones por defecto en móviles
document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('gesturestart', function(e) {
    e.preventDefault();
});