const levels = {
  easy: { wins: 0 },
  medium: { wins: 0 },
  hard: { wins: 0 },
  expert: { wins: 0 }
};

let currentLevel = 'easy';
let board = [];
let notes = Array(9).fill().map(() => Array(9).fill().map(() => []));
let selectedCell = null;
let isNoteMode = false;
let history = [];
let highlightNumber = null; // Adicione esta linha no topo do arquivo

// Gera tabuleiro completo e remove números conforme o nível
function generateSudokuBoard(level) {
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  function fillBoard(board) {
    for (let i = 0; i < 9; i++) {
      board[i] = [];
      for (let j = 0; j < 9; j++) {
        board[i][j] = 0;
      }
    }
    function isSafe(board, row, col, num) {
      for (let x = 0; x < 9; x++) {
        if (board[row][x] === num || board[x][col] === num) return false;
      }
      const startRow = row - row % 3, startCol = col - col % 3;
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
          if (board[i + startRow][j + startCol] === num) return false;
      return true;
    }
    function solve(board, row, col) {
      if (row === 9) return true;
      if (col === 9) return solve(board, row + 1, 0);
      if (board[row][col] !== 0) return solve(board, row, col + 1);
      let nums = shuffle([1,2,3,4,5,6,7,8,9]);
      for (let num of nums) {
        if (isSafe(board, row, col, num)) {
          board[row][col] = num;
          if (solve(board, row, col + 1)) return true;
          board[row][col] = 0;
        }
      }
      return false;
    }
    solve(board, 0, 0);
    return board;
  }
  function removeNumbers(board, level) {
    let attempts;
    if (level === 'easy') attempts = 35;
    else if (level === 'medium') attempts = 45;
    else if (level === 'hard') attempts = 55;
    else attempts = 60;
    let puzzle = board.map(row => row.slice());
    while (attempts > 0) {
      let row = Math.floor(Math.random() * 9);
      let col = Math.floor(Math.random() * 9);
      if (puzzle[row][col] !== '') {
        puzzle[row][col] = '';
        attempts--;
      }
    }
    return puzzle;
  }
  let board = [];
  fillBoard(board);
  return removeNumbers(board, level);
}

// Verifica se o número é repetido na linha, coluna ou bloco
function isCellError(row, col, value) {
  if (!value) return false;
  // Linha
  for (let j = 0; j < 9; j++) {
    if (j !== col && board[row][j] == value) return true;
  }
  // Coluna
  for (let i = 0; i < 9; i++) {
    if (i !== row && board[i][col] == value) return true;
  }
  // Bloco
  const startRow = row - row % 3, startCol = col - col % 3;
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) {
      const r = startRow + i, c = startCol + j;
      if ((r !== row || c !== col) && board[r][c] == value) return true;
    }
  return false;
}

// Verifica se o tabuleiro está completo e correto
function isBoardComplete() {
  for (let i = 0; i < 9; i++)
    for (let j = 0; j < 9; j++) {
      if (!board[i][j] || isCellError(i, j, board[i][j])) return false;
    }
  return true;
}

// Inicializa o jogo com o nível selecionado
function setLevel(level) {
  currentLevel = level;
  board = generateSudokuBoard(level);
  notes = Array(9).fill().map(() => Array(9).fill().map(() => []));
  selectedCell = null;
  history = [];
  renderBoard();
  updateWinsDisplay();
  document.getElementById('side-menu').classList.remove('open');
}

// Renderiza o tabuleiro
function renderBoard() {
  const container = document.getElementById('game-container');
  container.innerHTML = '';
  const table = document.createElement('table');
  table.id = 'sudoku-board';
  for (let i = 0; i < 9; i++) {
    const tr = document.createElement('tr');
    for (let j = 0; j < 9; j++) {
      const td = document.createElement('td');
      td.className = 'cell';
      td.dataset.row = i;
      td.dataset.col = j;
      if (i % 3 === 0) td.style.borderTop = '3px solid #222';
      if (j % 3 === 0) td.style.borderLeft = '3px solid #222';
      if (i === 8) td.style.borderBottom = '3px solid #222';
      if (j === 8) td.style.borderRight = '3px solid #222';

      if (board[i][j] !== '') {
        td.innerText = board[i][j];
        td.classList.add('fixed');
        td.onclick = () => selectCell(i, j);
        td.style.cursor = 'pointer';
        // Destaca todas as células com o número selecionado
        if (highlightNumber && board[i][j] == highlightNumber) {
          td.style.background = '#ff0'; // amarelo
        }
      } else {
        td.onclick = () => selectCell(i, j);
        td.style.cursor = 'pointer';
        if (notes[i][j].length > 0) {
          td.innerHTML = `<div style="font-size:0.7em;display:flex;flex-wrap:wrap;">${notes[i][j].join(' ')}</div>`;
        }
        if (board[i][j] !== '') {
          td.innerText = board[i][j];
          if (isCellError(i, j, board[i][j])) {
            td.style.background = '#f88'; // vermelho para erro
          }
        }
        // Destaca todas as células com o número selecionado
        if (highlightNumber && board[i][j] == highlightNumber) {
          td.style.background = '#ff0'; // amarelo
        }
      }
      if (selectedCell && selectedCell.row === i && selectedCell.col === j) {
        td.style.background = '#cce';
      }
      // Destaca erro se houver
      if (board[i][j] !== '' && !td.classList.contains('fixed') && isCellError(i, j, board[i][j])) {
        td.style.background = '#f88';
      }
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  container.appendChild(table);
  renderNumberPad();
}

// Seleciona célula
function selectCell(row, col) {
  selectedCell = { row, col };
  // Destaca todos os iguais ao valor da célula selecionada (se houver)
  highlightNumber = board[row][col] !== '' ? board[row][col] : null;
  renderBoard();
}

// Renderiza painel de números e botões
function renderNumberPad() {
  let pad = document.getElementById('number-pad');
  if (!pad) {
    pad = document.createElement('div');
    pad.id = 'number-pad';
    pad.style.display = 'flex';
    pad.style.flexDirection = 'column';
    pad.style.justifyContent = 'center';
    pad.style.alignItems = 'center';
    pad.style.marginTop = '20px';
    pad.style.gap = '10px';
    document.getElementById('game-container').appendChild(pad);
  }
  pad.innerHTML = '';

  // Linha dos números
  const numbersRow = document.createElement('div');
  numbersRow.style.display = 'flex';
  numbersRow.style.justifyContent = 'center';
  numbersRow.style.gap = '10px';
  for (let n = 1; n <= 9; n++) {
    const btn = document.createElement('button');
    btn.innerText = n;
    btn.style.width = '40px';
    btn.style.height = '40px';
    btn.onclick = () => handleNumberClick(n);
    numbersRow.appendChild(btn);
  }
  pad.appendChild(numbersRow);

  // Linha dos botões de modo/desfazer
  const actionsRow = document.createElement('div');
  actionsRow.style.display = 'flex';
  actionsRow.style.justifyContent = 'center';
  actionsRow.style.gap = '10px';
  actionsRow.style.marginTop = '10px';

  const noteBtn = document.createElement('button');
  noteBtn.innerText = isNoteMode ? 'Modo Normal' : 'Modo Anotação';
  noteBtn.onclick = () => {
    isNoteMode = !isNoteMode;
    renderNumberPad();
  };
  actionsRow.appendChild(noteBtn);

  // Botão desfazer
  const undoBtn = document.createElement('button');
  undoBtn.innerText = 'Desfazer';
  undoBtn.onclick = undoMove;
  actionsRow.appendChild(undoBtn);

  pad.appendChild(actionsRow);
}

// Insere número na célula selecionada
function handleNumberClick(n) {
  if (!selectedCell) return;
  const { row, col } = selectedCell;
  if (board[row][col] !== '') return; // Não pode alterar célula fixa
  history.push({
    board: board.map(r => r.slice()),
    notes: notes.map(r => r.map(c => c.slice()))
  });
  if (isNoteMode) {
    if (!notes[row][col].includes(n)) {
      notes[row][col].push(n);
      notes[row][col].sort();
    } else {
      notes[row][col] = notes[row][col].filter(x => x !== n);
    }
  } else {
    notes[row][col] = [];
    board[row][col] = n;
    // Remove n das notas da linha, coluna e bloco
    for (let i = 0; i < 9; i++) {
      notes[row][i] = notes[row][i].filter(x => x !== n);
      notes[i][col] = notes[i][col].filter(x => x !== n);
    }
    const startRow = row - row % 3, startCol = col - col % 3;
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        notes[startRow + i][startCol + j] = notes[startRow + i][startCol + j].filter(x => x !== n);
    // Atualiza destaque para o número recém inserido
    highlightNumber = n;
  }
  renderBoard();
  // Verifica vitória
  if (isBoardComplete()) {
    levels[currentLevel].wins++;
    updateWinsDisplay();
    setTimeout(() => {
      alert('Parabéns! Você completou o Sudoku!');
      setLevel(currentLevel);
    }, 100);
  }
}

// Desfaz última jogada
function undoMove() {
  if (history.length === 0) return;
  const last = history.pop();
  board = last.board.map(r => r.slice());
  notes = last.notes.map(r => r.map(c => c.slice()));
  renderBoard();
}

// Atualiza contadores de vitórias
function updateWinsDisplay() {
  document.getElementById('win-easy').innerText = levels.easy.wins || 0;
  document.getElementById('win-medium').innerText = levels.medium.wins || 0;
  document.getElementById('win-hard').innerText = levels.hard.wins || 0;
  document.getElementById('win-expert').innerText = levels.expert.wins || 0;
}

// Inicializa o jogo ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
  setLevel(currentLevel);
});