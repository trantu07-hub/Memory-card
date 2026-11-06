document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.memory-card');
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let score = 0;
    let matches = 0;
    let startTime = Date.now();
    let timerInterval;

    function startTimer() {
        timerInterval = setInterval(() => {
            const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
            document.getElementById('time').innerText = timeElapsed;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;

        this.classList.add('flip');

        if (!hasFlippedCard) {
            hasFlippedCard = true;
            firstCard = this;
            return;
        }

        secondCard = this;
        lockBoard = true;

        checkForMatch();
    }

    function checkForMatch() {
        let isMatch = firstCard.dataset.framework === secondCard.dataset.framework;

        isMatch ? disableCards() : unflipCards();
    }

    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        score += 10;
        matches += 1;
        updateScore();
        resetBoard();

        if (matches === 8) {
            endGame();
        }
    }

    function unflipCards() {
        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');
            resetBoard();
        }, 1500);
    }

    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }

    function shuffle() {
        cards.forEach(card => {
            let randomPos = Math.floor(Math.random() * 16);
            card.style.order = randomPos;
        });
    }

    function updateScore() {
        document.getElementById('score').innerText = score;
    }

    function endGame() {
        stopTimer();
        const finalScore = score;
        const finalTime = Math.floor((Date.now() - startTime) / 1000);
        document.getElementById('final-score').innerText = finalScore;
        document.getElementById('final-time').innerText = finalTime;
        document.getElementById('congratulations').classList.remove('hidden');
    }

    function resetGame() {
        cards.forEach(card => card.classList.remove('flip'));
        cards.forEach(card => card.addEventListener('click', flipCard));
        shuffle();
        [hasFlippedCard, lockBoard, matches, score] = [false, false, 0, 0];
        [firstCard, secondCard] = [null, null];
        startTime = Date.now();
        updateScore();
        document.getElementById('time').innerText = 0;
        document.getElementById('congratulations').classList.add('hidden');
        startTimer();
    }

    shuffle();
    startTimer();
    cards.forEach(card => card.addEventListener('click', flipCard));

    document.getElementById('replay-button').addEventListener('click', resetGame);
});
