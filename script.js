class PathfindingVisualizer {
    constructor() {
        this.rows = 25;
        this.cols = 50;
        this.grid = [];
        this.startNode = { row: 12, col: 10 };
        this.endNode = { row: 12, col: 40 };
        this.isDrawing = false;
        this.isDragging = null;
        this.isRunning = false;
        this.speed = 5;
        this.visitedCount = 0;
        this.pathLength = 0;
        this.startTime = 0;
        
        this.init();
        this.bindEvents();
    }

    init() {
        this.createGrid();
        this.renderGrid();
        this.updateStats();
    }

    createGrid() {
        this.grid = [];
        for (let row = 0; row < this.rows; row++) {
            const currentRow = [];
            for (let col = 0; col < this.cols; col++) {
                currentRow.push({
                    row,
                    col,
                    isWall: false,
                    isVisited: false,
                    isPath: false,
                    distance: Infinity,
                    previousNode: null,
                    heuristic: 0,
                    fCost: 0
                });
            }
            this.grid.push(currentRow);
        }
    }

    renderGrid() {
        const gridElement = document.getElementById('grid');
        gridElement.innerHTML = '';
        gridElement.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        gridElement.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                if (row === this.startNode.row && col === this.startNode.col) {
                    cell.classList.add('start');
                } else if (row === this.endNode.row && col === this.endNode.col) {
                    cell.classList.add('end');
                } else if (this.grid[row][col].isWall) {
                    cell.classList.add('wall');
                }
                
                gridElement.appendChild(cell);
            }
        }
    }

    bindEvents() {
        const grid = document.getElementById('grid');
        const startBtn = document.getElementById('start-btn');
        const clearPathBtn = document.getElementById('clear-path');
        const clearWallsBtn = document.getElementById('clear-walls');
        const generateMazeBtn = document.getElementById('generate-maze');
        const algorithmSelect = document.getElementById('algorithm');
        const speedSlider = document.getElementById('speed');

        // Grid events
        grid.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        grid.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        grid.addEventListener('mouseup', () => this.handleMouseUp());
        grid.addEventListener('contextmenu', (e) => e.preventDefault());

        // Control events
        startBtn.addEventListener('click', () => this.startPathfinding());
        clearPathBtn.addEventListener('click', () => this.clearPath());
        clearWallsBtn.addEventListener('click', () => this.clearWalls());
        generateMazeBtn.addEventListener('click', () => this.generateMaze());
        
        algorithmSelect.addEventListener('change', (e) => {
            document.getElementById('current-algorithm').textContent = 
                e.target.options[e.target.selectedIndex].text;
        });
        
        speedSlider.addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            document.getElementById('speed-value').textContent = `${this.speed}x`;
        });

        // Prevent drag on the entire document
        document.addEventListener('dragstart', (e) => e.preventDefault());
    }

    handleMouseDown(e) {
        if (this.isRunning) return;
        
        const cell = e.target.closest('.cell');
        if (!cell) return;

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        if (row === this.startNode.row && col === this.startNode.col) {
            this.isDragging = 'start';
        } else if (row === this.endNode.row && col === this.endNode.col) {
            this.isDragging = 'end';
        } else {
            this.isDrawing = true;
            this.toggleWall(row, col, e.button === 2);
        }
    }

    handleMouseMove(e) {
        if (this.isRunning) return;
        
        const cell = e.target.closest('.cell');
        if (!cell) return;

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        if (this.isDragging === 'start') {
            this.moveStartNode(row, col);
        } else if (this.isDragging === 'end') {
            this.moveEndNode(row, col);
        } else if (this.isDrawing) {
            this.toggleWall(row, col, e.buttons === 2);
        }
    }

    handleMouseUp() {
        this.isDrawing = false;
        this.isDragging = null;
    }

    toggleWall(row, col, remove = false) {
        if (row === this.startNode.row && col === this.startNode.col) return;
        if (row === this.endNode.row && col === this.endNode.col) return;

        this.grid[row][col].isWall = !remove;
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        
        if (remove) {
            cell.classList.remove('wall');
        } else {
            cell.classList.add('wall');
        }
    }

    moveStartNode(row, col) {
        if (this.grid[row][col].isWall) return;
        if (row === this.endNode.row && col === this.endNode.col) return;

        const oldCell = document.querySelector(`[data-row="${this.startNode.row}"][data-col="${this.startNode.col}"]`);
        const newCell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        
        oldCell.classList.remove('start');
        newCell.classList.add('start');
        
        this.startNode = { row, col };
    }

    moveEndNode(row, col) {
        if (this.grid[row][col].isWall) return;
        if (row === this.startNode.row && col === this.startNode.col) return;

        const oldCell = document.querySelector(`[data-row="${this.endNode.row}"][data-col="${this.endNode.col}"]`);
        const newCell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        
        oldCell.classList.remove('end');
        newCell.classList.add('end');
        
        this.endNode = { row, col };
    }

    async startPathfinding() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.clearPath();
        
        const algorithm = document.getElementById('algorithm').value;
        const startBtn = document.getElementById('start-btn');
        
        startBtn.textContent = 'Running...';
        startBtn.disabled = true;
        
        this.startTime = Date.now();
        
        let result;
        switch (algorithm) {
            case 'dijkstra':
                result = await this.dijkstra();
                break;
            case 'astar':
                result = await this.aStar();
                break;
            case 'bfs':
                result = await this.bfs();
                break;
            case 'dfs':
                result = await this.dfs();
                break;
        }

        if (result.path) {
            await this.animatePath(result.path);
        }

        this.isRunning = false;
        startBtn.textContent = 'Start Pathfinding';
        startBtn.disabled = false;
        
        this.updateStats();
    }

    async dijkstra() {
        const visitedNodes = [];
        const unvisitedNodes = this.getAllNodes();
        const startNode = this.grid[this.startNode.row][this.startNode.col];
        startNode.distance = 0;

        while (unvisitedNodes.length) {
            this.sortByDistance(unvisitedNodes);
            const closestNode = unvisitedNodes.shift();

            if (closestNode.isWall) continue;
            if (closestNode.distance === Infinity) break;

            closestNode.isVisited = true;
            visitedNodes.push(closestNode);

            if (closestNode.row === this.endNode.row && closestNode.col === this.endNode.col) {
                return { visitedNodes, path: this.getPath(closestNode) };
            }

            await this.updateNeighbors(closestNode);
            await this.visualizeNode(closestNode, 'visited');
        }

        return { visitedNodes, path: null };
    }

    async aStar() {
        const openSet = [];
        const closedSet = [];
        const startNode = this.grid[this.startNode.row][this.startNode.col];
        const endNode = this.grid[this.endNode.row][this.endNode.col];

        startNode.distance = 0;
        startNode.heuristic = this.heuristic(startNode, endNode);
        startNode.fCost = startNode.heuristic;
        openSet.push(startNode);

        while (openSet.length > 0) {
            openSet.sort((a, b) => a.fCost - b.fCost);
            const current = openSet.shift();

            if (current.row === this.endNode.row && current.col === this.endNode.col) {
                return { visitedNodes: closedSet, path: this.getPath(current) };
            }

            closedSet.push(current);
            current.isVisited = true;

            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors) {
                if (neighbor.isWall || closedSet.includes(neighbor)) continue;

                const tentativeG = current.distance + 1;

                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                } else if (tentativeG >= neighbor.distance) {
                    continue;
                }

                neighbor.previousNode = current;
                neighbor.distance = tentativeG;
                neighbor.heuristic = this.heuristic(neighbor, endNode);
                neighbor.fCost = neighbor.distance + neighbor.heuristic;
            }

            await this.visualizeNode(current, 'visited');
        }

        return { visitedNodes: closedSet, path: null };
    }

    async bfs() {
        const queue = [];
        const visitedNodes = [];
        const startNode = this.grid[this.startNode.row][this.startNode.col];
        
        queue.push(startNode);
        startNode.isVisited = true;

        while (queue.length > 0) {
            const current = queue.shift();
            visitedNodes.push(current);

            if (current.row === this.endNode.row && current.col === this.endNode.col) {
                return { visitedNodes, path: this.getPath(current) };
            }

            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors) {
                if (!neighbor.isVisited && !neighbor.isWall) {
                    neighbor.isVisited = true;
                    neighbor.previousNode = current;
                    queue.push(neighbor);
                }
            }

            await this.visualizeNode(current, 'visited');
        }

        return { visitedNodes, path: null };
    }

    async dfs() {
        const stack = [];
        const visitedNodes = [];
        const startNode = this.grid[this.startNode.row][this.startNode.col];
        
        stack.push(startNode);

        while (stack.length > 0) {
            const current = stack.pop();
            
            if (current.isVisited) continue;
            
            current.isVisited = true;
            visitedNodes.push(current);

            if (current.row === this.endNode.row && current.col === this.endNode.col) {
                return { visitedNodes, path: this.getPath(current) };
            }

            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors.reverse()) {
                if (!neighbor.isVisited && !neighbor.isWall) {
                    neighbor.previousNode = current;
                    stack.push(neighbor);
                }
            }

            await this.visualizeNode(current, 'visited');
        }

        return { visitedNodes, path: null };
    }

    heuristic(nodeA, nodeB) {
        // Manhattan distance
        return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
    }

    getAllNodes() {
        const nodes = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                nodes.push(this.grid[row][col]);
            }
        }
        return nodes;
    }

    sortByDistance(unvisitedNodes) {
        unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
    }

    async updateNeighbors(node) {
        const neighbors = this.getNeighbors(node);
        for (const neighbor of neighbors) {
            if (!neighbor.isWall) {
                const newDistance = node.distance + 1;
                if (newDistance < neighbor.distance) {
                    neighbor.distance = newDistance;
                    neighbor.previousNode = node;
                }
            }
        }
    }

    getNeighbors(node) {
        const neighbors = [];
        const { row, col } = node;

        if (row > 0) neighbors.push(this.grid[row - 1][col]);
        if (row < this.rows - 1) neighbors.push(this.grid[row + 1][col]);
        if (col > 0) neighbors.push(this.grid[row][col - 1]);
        if (col < this.cols - 1) neighbors.push(this.grid[row][col + 1]);

        return neighbors;
    }

    getPath(endNode) {
        const path = [];
        let currentNode = endNode;
        
        while (currentNode !== null) {
            path.unshift(currentNode);
            currentNode = currentNode.previousNode;
        }
        
        return path;
    }

    async visualizeNode(node, type) {
        if (node.row === this.startNode.row && node.col === this.startNode.col) return;
        if (node.row === this.endNode.row && node.col === this.endNode.col) return;

        const cell = document.querySelector(`[data-row="${node.row}"][data-col="${node.col}"]`);
        cell.classList.add(type);

        if (type === 'visited') {
            this.visitedCount++;
        }

        await this.delay(101 - (this.speed * 10));
    }

    async animatePath(path) {
        this.pathLength = path.length - 1; // Exclude start node
        
        for (let i = 1; i < path.length - 1; i++) {
            const node = path[i];
            const cell = document.querySelector(`[data-row="${node.row}"][data-col="${node.col}"]`);
            cell.classList.remove('visited');
            cell.classList.add('path');
            await this.delay(50);
        }
    }

    clearPath() {
        this.visitedCount = 0;
        this.pathLength = 0;
        
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('visited', 'path');
        });

        // Reset grid state
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const node = this.grid[row][col];
                node.isVisited = false;
                node.isPath = false;
                node.distance = Infinity;
                node.previousNode = null;
                node.heuristic = 0;
                node.fCost = 0;
            }
        }

        this.updateStats();
    }

    clearWalls() {
        const cells = document.querySelectorAll('.cell.wall');
        cells.forEach(cell => {
            cell.classList.remove('wall');
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            this.grid[row][col].isWall = false;
        });
    }

    generateMaze() {
        if (this.isRunning) return;
        
        this.clearWalls();
        this.clearPath();

        // Simple maze generation using randomized Prim's algorithm
        const walls = [];
        
        // Fill entire grid with walls
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (row === this.startNode.row && col === this.startNode.col) continue;
                if (row === this.endNode.row && col === this.endNode.col) continue;
                
                this.grid[row][col].isWall = true;
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                cell.classList.add('wall');
            }
        }

        // Start from a random cell
        const startRow = Math.floor(Math.random() * this.rows);
        const startCol = Math.floor(Math.random() * this.cols);
        
        this.grid[startRow][startCol].isWall = false;
        const startCell = document.querySelector(`[data-row="${startRow}"][data-col="${startCol}"]`);
        startCell.classList.remove('wall');

        // Add neighboring walls to the list
        this.addNeighboringWalls(startRow, startCol, walls);

        while (walls.length > 0) {
            const randomIndex = Math.floor(Math.random() * walls.length);
            const wall = walls[randomIndex];
            walls.splice(randomIndex, 1);

            const { row, col } = wall;
            const neighbors = this.getMazeNeighbors(row, col);
            const pathNeighbors = neighbors.filter(n => !this.grid[n.row][n.col].isWall);

            if (pathNeighbors.length === 1) {
                this.grid[row][col].isWall = false;
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                cell.classList.remove('wall');
                
                this.addNeighboringWalls(row, col, walls);
            }
        }

        // Ensure start and end nodes are not walls
        this.grid[this.startNode.row][this.startNode.col].isWall = false;
        this.grid[this.endNode.row][this.endNode.col].isWall = false;
        
        const startNodeCell = document.querySelector(`[data-row="${this.startNode.row}"][data-col="${this.startNode.col}"]`);
        const endNodeCell = document.querySelector(`[data-row="${this.endNode.row}"][data-col="${this.endNode.col}"]`);
        
        startNodeCell.classList.remove('wall');
        endNodeCell.classList.remove('wall');
    }

    addNeighboringWalls(row, col, walls) {
        const directions = [
            { row: -2, col: 0 }, { row: 2, col: 0 },
            { row: 0, col: -2 }, { row: 0, col: 2 }
        ];

        for (const dir of directions) {
            const newRow = row + dir.row;
            const newCol = col + dir.col;
            const wallRow = row + dir.row / 2;
            const wallCol = col + dir.col / 2;

            if (this.isValidCell(newRow, newCol) && this.isValidCell(wallRow, wallCol)) {
                if (this.grid[wallRow][wallCol].isWall && 
                    !walls.some(w => w.row === wallRow && w.col === wallCol)) {
                    walls.push({ row: wallRow, col: wallCol });
                }
            }
        }
    }

    getMazeNeighbors(row, col) {
        const neighbors = [];
        const directions = [
            { row: -2, col: 0 }, { row: 2, col: 0 },
            { row: 0, col: -2 }, { row: 0, col: 2 }
        ];

        for (const dir of directions) {
            const newRow = row + dir.row;
            const newCol = col + dir.col;

            if (this.isValidCell(newRow, newCol)) {
                neighbors.push({ row: newRow, col: newCol });
            }
        }

        return neighbors;
    }

    isValidCell(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    updateStats() {
        document.getElementById('nodes-visited').textContent = this.visitedCount;
        document.getElementById('path-length').textContent = this.pathLength;
        
        const timeElapsed = this.isRunning ? Date.now() - this.startTime : 0;
        document.getElementById('time-elapsed').textContent = `${timeElapsed}ms`;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PathfindingVisualizer();

    // Update stats periodically while running
    setInterval(() => {
        const visualizer = window.pathfindingVisualizer;
        if (visualizer && visualizer.isRunning) {
            visualizer.updateStats();
        }
    }, 100);
});

// Make visualizer globally accessible
window.addEventListener('load', () => {
    window.pathfindingVisualizer = new PathfindingVisualizer();
});