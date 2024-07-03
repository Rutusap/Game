const triviaAPI = 'https://the-trivia-api.com/v2/questions';
let players = [{ name: '', score: 0 }, { name: '', score: 0 }];
let currentPlayer = 0;
let questions = [];
let usedCategories = [];

document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('select-category').addEventListener('click', selectCategory);
document.getElementById('next-question').addEventListener('click', nextQuestion);
document.getElementById('restart-game').addEventListener('click', () => location.reload());

async function startGame() {
    players[0].name = document.getElementById('player1').value;
    players[1].name = document.getElementById('player2').value;
    if (!players[0].name || !players[1].name) {
        alert('Please enter both player names.');
        return;
    }
    document.getElementById('player-setup').style.display = 'none';
    document.getElementById('category-selection').style.display = 'block';
    const categories = await fetchCategories();
    populateCategories(categories);
}

async function fetchCategories() {
    const response = await fetch('https://the-trivia-api.com/api/categories');
    const data = await response.json();
    return data;
}

function populateCategories(categories) {
    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = '';
    Object.keys(categories).forEach(category => {
        if (!usedCategories.includes(category)) {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryList.appendChild(option);
        }
    });
}

async function selectCategory() {
    const category = document.getElementById('category-list').value;
    if (!category) {
        alert('Please select a category.');
        return;
    }
    usedCategories.push(category);
    const response = await fetch(`${triviaAPI}?categories=${category}&limit=6`);
    const data = await response.json();
    console.log(data);  // Add this line to check the API response
    questions = data;
    if (questions.length === 0) {
        alert('No questions found for this category. Please select another category.');
        return;
    }
    document.getElementById('category-selection').style.display = 'none';
    document.getElementById('question-area').style.display = 'block';
    showQuestion();
}

function showQuestion() {
    if (questions.length === 0) {
        endGame();  // End the game if no more questions are available
        return;
    }

    const question = questions.shift();
    document.getElementById('question-text').textContent = question.question.text;
    const answerOptions = document.getElementById('answer-options');
    answerOptions.innerHTML = '';
    const allAnswers = [...question.incorrectAnswers, question.correctAnswer];
    allAnswers.sort(() => Math.random() - 0.5);
    allAnswers.forEach(answer => {
        const button = document.createElement('button');
        button.textContent = answer;
        button.addEventListener('click', () => checkAnswer(answer, question.correctAnswer));
        answerOptions.appendChild(button);
    });
}

function checkAnswer(selectedAnswer, correctAnswer) {
    let score = 0;
    if (selectedAnswer === correctAnswer) {
        if (questions.length % 3 === 2) {
            score = 10;
        } else if (questions.length % 3 === 1) {
            score = 15;
        } else {
            score = 20;
        }
        players[currentPlayer].score += score;
    }
    currentPlayer = (currentPlayer + 1) % 2;
    document.getElementById('next-question').style.display = 'block';
}

async function nextQuestion() {
    document.getElementById('next-question').style.display = 'none';
    if (questions.length > 0) {
        showQuestion();
    } else {
        if (usedCategories.length === Object.keys(await fetchCategories()).length) {
            endGame();
        } else {
            document.getElementById('category-selection').style.display = 'block';
            document.getElementById('question-area').style.display = 'none';
        }
    }
}
function endGame() {
    document.getElementById('question-area').style.display = 'none';
    document.getElementById('game-end').style.display = 'block';
    const scoresText = `${players[0].name}: ${players[0].score} points<br>${players[1].name}: ${players[1].score} points<br>`;
    const winner = players[0].score === players[1].score ? 'It\'s a tie!' : `${players[0].score > players[1].score ? players[0].name : players[1].name} wins!`;
    document.getElementById('final-scores').innerHTML = scoresText + winner;
}

