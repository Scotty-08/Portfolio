const rows = 16;
const cols = 24;
const gridElement = document.querySelector("#grid");
const solveButton = document.querySelector("#solveButton");
const randomButton = document.querySelector("#randomButton");
const clearButton = document.querySelector("#clearButton");
const visitedCountElement = document.querySelector("#visitedTiles");
const pathLengthElement = document.querySelector("#pathLength");
const statusMessage = document.querySelector("#statusMessage");
const toolButtons = document.querySelectorAll(".tool-button");

let activeTool = "wall";
let startCell = { row: 7, col: 4 };
let endCell = { row: 7, col: 19 };
let isSolving = false;
let maze = createEmptyMaze();

function createEmptyMaze() {
  return Array.from({ length: rows }, () => Array(cols).fill("empty"));
}

function cellKey(cell) {
  return `${cell.row},${cell.col}`;
}

function isSameCell(a, b) {
  return a.row === b.row && a.col === b.col;
}

function renderGrid() {
  gridElement.innerHTML = "";

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.setAttribute("aria-label", `Row ${row + 1}, column ${col + 1}`);
      cell.dataset.row = row;
      cell.dataset.col = col;

      if (isSameCell({ row, col }, startCell)) {
        cell.classList.add("start");
      } else if (isSameCell({ row, col }, endCell)) {
        cell.classList.add("end");
      } else if (maze[row][col] !== "empty") {
        cell.classList.add(maze[row][col]);
      }

      cell.addEventListener("click", () => handleCellClick(row, col));
      gridElement.appendChild(cell);
    }
  }
}

function handleCellClick(row, col) {
  if (isSolving) return;

  clearSolvedCells();

  if (activeTool === "start" && !isSameCell({ row, col }, endCell)) {
    startCell = { row, col };
    maze[row][col] = "empty";
  }

  if (activeTool === "end" && !isSameCell({ row, col }, startCell)) {
    endCell = { row, col };
    maze[row][col] = "empty";
  }

  if (activeTool === "wall" && !isSameCell({ row, col }, startCell) && !isSameCell({ row, col }, endCell)) {
    maze[row][col] = maze[row][col] === "wall" ? "empty" : "wall";
  }

  if (activeTool === "erase") {
    maze[row][col] = "empty";
  }

  resetStats();
  renderGrid();
}

function setActiveTool(tool) {
  activeTool = tool;
  toolButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tool === tool);
  });
}

function clearSolvedCells() {
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (maze[row][col] === "visited" || maze[row][col] === "path") {
        maze[row][col] = "empty";
      }
    }
  }
}

function resetStats() {
  visitedCountElement.textContent = "0";
  pathLengthElement.textContent = "0";
}

function getNeighbors(cell) {
  const possibleMoves = [
    { row: cell.row - 1, col: cell.col },
    { row: cell.row + 1, col: cell.col },
    { row: cell.row, col: cell.col - 1 },
    { row: cell.row, col: cell.col + 1 },
  ];

  return possibleMoves.filter((move) => {
    const insideGrid = move.row >= 0 && move.row < rows && move.col >= 0 && move.col < cols;
    return insideGrid && maze[move.row][move.col] !== "wall";
  });
}

function solveMaze() {
  clearSolvedCells();
  resetStats();

  const queue = [startCell];
  const visited = new Set([cellKey(startCell)]);
  const previous = new Map();
  const visitOrder = [];

  while (queue.length > 0) {
    const current = queue.shift();
    visitOrder.push(current);

    if (isSameCell(current, endCell)) {
      return { found: true, visitOrder, path: buildPath(previous, current) };
    }

    for (const neighbor of getNeighbors(current)) {
      const key = cellKey(neighbor);
      if (!visited.has(key)) {
        visited.add(key);
        previous.set(key, current);
        queue.push(neighbor);
      }
    }
  }

  return { found: false, visitOrder, path: [] };
}

function buildPath(previous, finalCell) {
  const path = [finalCell];
  let current = finalCell;

  while (!isSameCell(current, startCell)) {
    current = previous.get(cellKey(current));
    path.unshift(current);
  }

  return path;
}

async function animateSolution(result) {
  isSolving = true;
  statusMessage.textContent = result.found
    ? "Animating the search order and shortest route."
    : "No path found. Try removing a few walls and solve again.";

  for (const cell of result.visitOrder) {
    if (!isSameCell(cell, startCell) && !isSameCell(cell, endCell)) {
      maze[cell.row][cell.col] = "visited";
      renderGrid();
      await wait(18);
    }
  }

  if (result.found) {
    for (const cell of result.path) {
      if (!isSameCell(cell, startCell) && !isSameCell(cell, endCell)) {
        maze[cell.row][cell.col] = "path";
        renderGrid();
        await wait(32);
      }
    }
  }

  visitedCountElement.textContent = result.visitOrder.length;
  pathLengthElement.textContent = result.path.length;
  isSolving = false;
}

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function randomizeMaze() {
  if (isSolving) return;

  maze = createEmptyMaze();
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const cell = { row, col };
      if (!isSameCell(cell, startCell) && !isSameCell(cell, endCell) && Math.random() < 0.27) {
        maze[row][col] = "wall";
      }
    }
  }

  resetStats();
  statusMessage.textContent = "Generated a random maze. Click Solve Maze to run BFS.";
  renderGrid();
}

function clearMaze() {
  if (isSolving) return;

  maze = createEmptyMaze();
  resetStats();
  statusMessage.textContent = "Grid cleared. Add walls or move the start and finish points.";
  renderGrid();
}

toolButtons.forEach((button) => {
  button.addEventListener("click", () => setActiveTool(button.dataset.tool));
});

solveButton.addEventListener("click", () => {
  if (isSolving) return;
  const result = solveMaze();
  animateSolution(result);
});

randomButton.addEventListener("click", randomizeMaze);
clearButton.addEventListener("click", clearMaze);

renderGrid();
