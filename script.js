class PathfindingVisualizer {
    constructor() {
        this.setGridSize();
        this.grid = [];
        this.startNode = { row: Math.floor(this.rows / 2), col: Math.floor(this.cols / 4) };
        this.endNode = { row: Math.floor(this.rows / 2), col: Math.floor(3 * this.cols / 4) };
        this.isDrawing = false;
        this.isDragging = null;
        this.isRunning = false;
        this.speed = 5;
        this.visitedCount = 0;
        this.pathLength = 0;
        this.startTime = 0;
        this.finalTime = 0; // Store final elapsed time
        
        this.init();
        this.bindEvents();
        this.handleResize();
    }

    setGridSize() {
        const width = window.innerWidth;
        if (width < 480) {
            this.rows = 20;
            this.cols = 25;
        } else if (width < 768) {
            this.rows = 22;
            this.cols = 30;
        } else if (width < 1024) {
            this.rows = 24;
            this.cols = 40;
        } else {
            this.rows = 25;
            this.cols = 50;
        }
    }

    handleResize() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (this.isRunning) return;
                
                const oldRows = this.rows;
                const oldCols = this.cols;
                
                this.setGridSize();
                
                if (oldRows !== this.rows || oldCols !== this.cols) {
                    // Adjust start and end node positions if they're out of bounds
                    this.startNode.row = Math.min(this.startNode.row, this.rows - 1);
                    this.startNode.col = Math.min(this.startNode.col, this.cols - 1);
                    this.endNode.row = Math.min(this.endNode.row, this.rows - 1);
                    this.endNode.col = Math.min(this.endNode.col, this.cols - 1);
                    
                    this.createGrid();
                    this.renderGrid();
                    this.updateStats();
                }
            }, 250);
        });
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

        // Grid events with touch support
        grid.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        grid.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        grid.addEventListener('mouseup', () => this.handleMouseUp());
        grid.addEventListener('contextmenu', (e) => e.preventDefault());

        // Touch events for mobile
        grid.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        grid.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        grid.addEventListener('touchend', () => this.handleTouchEnd());

        // Control events
        startBtn.addEventListener('click', () => this.startPathfinding());
        clearPathBtn.addEventListener('click', () => this.clearPath());
        clearWallsBtn.addEventListener('click', () => this.clearWalls());
        generateMazeBtn.addEventListener('click', () => this.generateMaze());
        
        algorithmSelect.addEventListener('change', (e) => {
            const currentAlgElement = document.getElementById('current-algorithm');
            if (currentAlgElement) {
                currentAlgElement.textContent = e.target.options[e.target.selectedIndex].text;
            }
        });
        
        speedSlider.addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            const speedValueElement = document.getElementById('speed-value');
            if (speedValueElement) {
                speedValueElement.textContent = `${this.speed}x`;
            }
        });

        // Prevent drag on the entire document
        document.addEventListener('dragstart', (e) => e.preventDefault());
    }

    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const cell = document.elementFromPoint(touch.clientX, touch.clientY);
        if (cell && cell.classList.contains('cell')) {
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY,
                button: 0
            });
            mouseEvent.target = cell;
            this.handleMouseDown(mouseEvent);
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const cell = document.elementFromPoint(touch.clientX, touch.clientY);
        if (cell && cell.classList.contains('cell')) {
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY,
                buttons: 1
            });
            mouseEvent.target = cell;
            this.handleMouseMove(mouseEvent);
        }
    }

    handleTouchEnd() {
        this.handleMouseUp();
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
        this.finalTime = 0; // Reset final time
        
        let result;
        try {
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
        } catch (error) {
            console.error('Pathfinding error:', error);
        }

        // Calculate final time BEFORE setting isRunning to false
        this.finalTime = Date.now() - this.startTime;
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
    const visitedNodes = [];
    const startNode = this.grid[this.startNode.row][this.startNode.col];
    startNode.distance = 0;
    
    const dfsRecursive = async (node) => {
        // Mark as visited
        node.isVisited = true;
        visitedNodes.push(node);
        
        // Visualize the node
        await this.visualizeNode(node, 'visited');
        
        // Check if we reached the end
        if (node.row === this.endNode.row && node.col === this.endNode.col) {
            return true; // Found the target
        }
        
        // Explore neighbors
        const neighbors = this.getNeighbors(node);
        
        for (const neighbor of neighbors) {
            if (!neighbor.isVisited && !neighbor.isWall) {
                neighbor.previousNode = node;
                neighbor.distance = node.distance + 1;
                
                if (await dfsRecursive(neighbor)) {
                    return true; // Found path through this neighbor
                }
            }
        }
        
        return false; // No path found through this node
    };
    
    const found = await dfsRecursive(startNode);
    const endNode = this.grid[this.endNode.row][this.endNode.col];
    
    return { 
        visitedNodes, 
        path: found ? this.getPath(endNode) : null 
    };
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
        if (cell) {
            cell.classList.add(type);

            if (type === 'visited') {
                this.visitedCount++;
            }

            await this.delay(Math.max(1, 101 - (this.speed * 10)));
        }
    }

    async animatePath(path) {
        this.pathLength = path.length - 1; // Exclude start node
        
        for (let i = 1; i < path.length - 1; i++) {
            const node = path[i];
            const cell = document.querySelector(`[data-row="${node.row}"][data-col="${node.col}"]`);
            if (cell) {
                cell.classList.remove('visited');
                cell.classList.add('path');
                await this.delay(50);
            }
        }
    }

    clearPath() {
        this.visitedCount = 0;
        this.pathLength = 0;
        this.finalTime = 0; // Reset final time when clearing
        
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
                if (cell) {
                    cell.classList.add('wall');
                }
            }
        }

        // Start from a random cell
        const startRow = Math.floor(Math.random() * this.rows);
        const startCol = Math.floor(Math.random() * this.cols);
        
        this.grid[startRow][startCol].isWall = false;
        const startCell = document.querySelector(`[data-row="${startRow}"][data-col="${startCol}"]`);
        if (startCell) {
            startCell.classList.remove('wall');
        }

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
                if (cell) {
                    cell.classList.remove('wall');
                }
                
                this.addNeighboringWalls(row, col, walls);
            }
        }

        // Ensure start and end nodes are not walls
        this.grid[this.startNode.row][this.startNode.col].isWall = false;
        this.grid[this.endNode.row][this.endNode.col].isWall = false;
        
        const startNodeCell = document.querySelector(`[data-row="${this.startNode.row}"][data-col="${this.startNode.col}"]`);
        const endNodeCell = document.querySelector(`[data-row="${this.endNode.row}"][data-col="${this.endNode.col}"]`);
        
        if (startNodeCell) startNodeCell.classList.remove('wall');
        if (endNodeCell) endNodeCell.classList.remove('wall');
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
        const nodesVisitedElement = document.getElementById('nodes-visited');
        const pathLengthElement = document.getElementById('path-length');
        const timeElapsedElement = document.getElementById('time-elapsed');

        if (nodesVisitedElement) {
            nodesVisitedElement.textContent = this.visitedCount;
        }
        if (pathLengthElement) {
            pathLengthElement.textContent = this.pathLength;
        }
        if (timeElapsedElement) {
            // Show real-time elapsed time while running, final time when finished
            const timeElapsed = this.isRunning 
                ? (this.startTime > 0 ? Date.now() - this.startTime : 0)
                : this.finalTime;
            timeElapsedElement.textContent = `${timeElapsed}ms`;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const visualizer = new PathfindingVisualizer();
    
    // Make visualizer globally accessible
    window.pathfindingVisualizer = visualizer;

    // Update stats periodically while running
    setInterval(() => {
        if (visualizer.isRunning) {
            visualizer.updateStats();
        }
    }, 100);
});

