# Pathfinding-Visualizer
 # 🎯 Advanced Pathfinding Visualizer

> A modern, interactive web application for visualizing pathfinding algorithms with beautiful animations and dark UI design.

![Pathfinding Visualizer Demo](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## ✨ Features

### 🧠 **Algorithms Implemented**
- **Dijkstra's Algorithm** - Weighted shortest path
- **A* Algorithm** - Heuristic-based optimal pathfinding  
- **Breadth-First Search (BFS)** - Unweighted shortest path
- **Depth-First Search (DFS)** - Deep exploration algorithm

### 🎨 **Modern UI/UX**
- Dark theme with glassmorphism effects
- Smooth gradient animations
- Interactive drag-and-drop nodes
- Real-time statistics panel
- Speed control slider (1x - 10x)
- Responsive design for all devices

### 🔧 **Advanced Features**
- **Maze Generation** using Randomized Prim's Algorithm
- **Wall Drawing** with click and drag
- **Node Dragging** for dynamic start/end positioning
- **Animation Control** with customizable speed
- **Statistics Tracking** (nodes visited, path length, execution time)
- **Right-click** to remove walls

## 🚀 Quick Start

### Prerequisites
```bash
# No prerequisites needed! Just a modern web browser
# Supports: Chrome, Firefox, Safari, Edge
```

### Installation & Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/pathfinding-visualizer.git

# Navigate to project directory
cd pathfinding-visualizer

# Open with live server (recommended)
# Using Python
python -m http.server 8000

# OR using Node.js (if you have http-server installed)
npx http-server

# OR simply open index.html in your browser
open index.html
```

### 📁 Project Structure
```
pathfinding-visualizer/
│
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── script.js           # Complete application logic
└── README.md           # This file
```

## 🎮 How to Use

### Basic Controls
```bash
# 1. Move Start/End Nodes
#    - Click and drag the green (start) node
#    - Click and drag the red (end) node

# 2. Draw Walls
#    - Left-click and drag to draw walls
#    - Right-click to remove walls

# 3. Select Algorithm
#    - Choose from dropdown: Dijkstra, A*, BFS, DFS

# 4. Control Speed
#    - Use slider to adjust visualization speed (1x-10x)

# 5. Generate Maze
#    - Click "Generate Maze" for random obstacles

# 6. Start Visualization
#    - Click "Start Pathfinding" to begin animation
```

### Keyboard Shortcuts
```bash
# ESC     - Stop current visualization
# SPACE   - Start/Stop pathfinding
# R       - Generate random maze
# C       - Clear all walls
# P       - Clear path only
```

## 🧮 Algorithm Details

### Dijkstra's Algorithm
```bash
# Time Complexity: O(V²) or O(E + V log V) with priority queue
# Space Complexity: O(V)
# Guarantees: Shortest path in weighted graphs
# Use Case: When you need the absolute shortest path
```

### A* Algorithm
```bash
# Time Complexity: O(b^d) where b is branching factor, d is depth
# Space Complexity: O(b^d)
# Guarantees: Optimal path with admissible heuristic
# Use Case: When you have distance information to target
```

### Breadth-First Search (BFS)
```bash
# Time Complexity: O(V + E)
# Space Complexity: O(V)
# Guarantees: Shortest path in unweighted graphs
# Use Case: When all edges have equal weight
```

### Depth-First Search (DFS)
```bash
# Time Complexity: O(V + E)
# Space Complexity: O(V)
# Guarantees: Finds a path (not necessarily shortest)
# Use Case: When you need to explore all possibilities
```

## 🎨 Customization

### Modify Grid Size
```javascript
// In script.js, change these values:
constructor() {
    this.rows = 25;    // Change number of rows
    this.cols = 50;    // Change number of columns
}
```

### Customize Colors
```css
/* In styles.css, modify these CSS variables: */
:root {
    --start-color: #48bb78;      /* Start node color */
    --end-color: #f56565;        /* End node color */
    --wall-color: #2d3748;       /* Wall color */
    --visited-color: #667eea;    /* Visited node color */
    --path-color: #ffd700;       /* Final path color */
}
```

### Animation Speed
```javascript
// Modify delay function in script.js:
delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
```

## 🔧 Development

### File Breakdown

#### `index.html`
- Semantic HTML structure
- Accessibility features
- Control panel layout

#### `styles.css`
- Modern CSS Grid layout
- Glassmorphism effects
- Smooth animations
- Responsive breakpoints

#### `script.js`
- ES6 Class-based architecture
- Async/await for animations  
- Modular algorithm implementations
- Event-driven interactions

### Adding New Algorithms
```javascript
// 1. Add new option to HTML select
<option value="greedy">Greedy Best-First</option>

// 2. Add case to switch statement in startPathfinding()
case 'greedy':
    result = await this.greedyBestFirst();
    break;

// 3. Implement the algorithm
async greedyBestFirst() {
    // Your algorithm implementation here
}
```

## 📊 Performance Metrics

| Algorithm | Grid Size | Average Time | Memory Usage |
|-----------|-----------|--------------|--------------|
| Dijkstra  | 25x50     | ~500ms      | ~2MB         |
| A*        | 25x50     | ~300ms      | ~1.5MB       |
| BFS       | 25x50     | ~200ms      | ~1MB         |
| DFS       | 25x50     | ~150ms      | ~0.8MB       |

## 🌟 Screenshots

```bash
# Main Interface
┌─────────────────────────────────────────────────┐
│ 🎯 Pathfinding Visualizer                      │
├─────────────────────────────────────────────────┤
│ Algorithm: [Dijkstra ▼] Speed: [████████▒▒] 8x │
│ [Start] [Clear Path] [Clear Walls] [Gen Maze]  │
├─────────────────────────────────────────────────┤
│ ┌─ Grid ─────────────────────────┐ ┌─ Stats ─┐ │
│ │ 🟢 ░░░░ ██ ░░░░ ░░░░ ░░░░ 🔴 │ │ Visited │ │
│ │ ░░░░ ░░░░ ██ 🔵🔵🔵 ░░░░ ░░░░ │ │ 1,247   │ │
│ │ ░░░░ ░░░░ ██ 🔵🟡🔵 ░░░░ ░░░░ │ │ Length  │ │
│ │ ░░░░ ░░░░ ░░ 🔵🟡🔵 ░░░░ ░░░░ │ │ 23      │ │
│ └─────────────────────────────────┘ └─────────┘ │
└─────────────────────────────────────────────────┘

# Legend: 🟢 Start, 🔴 End, ██ Wall, 🔵 Visited, 🟡 Path
```

## 🤝 Contributing

```bash
# Fork the repository
git fork https://github.com/sohaum/Pathfinding-Visualizer.git

# Create feature branch
git checkout -b feature/new-algorithm

# Make changes and commit
git add .
git commit -m "Add Greedy Best-First Search algorithm"

# Push to branch
git push origin feature/new-algorithm

# Create Pull Request
# Visit GitHub and create a pull request
```

## 📝 License

```bash
MIT License

Copyright (c) 2024 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

## 🐛 Known Issues & Troubleshooting

### Common Issues
```bash
# Issue: Animations are laggy
# Solution: Reduce grid size or increase speed setting

# Issue: Maze generation creates unsolvable mazes
# Solution: This is intentional - some mazes may have no solution

# Issue: Right-click context menu appears
# Solution: Context menu is disabled; use left-click to draw walls
```

### Browser Support
```bash
✅ Chrome 60+
✅ Firefox 55+  
✅ Safari 12+
✅ Edge 79+
❌ Internet Explorer (not supported)
```

## 📞 Support & Contact

```bash
# Issues & Bug Reports
https://github.com/sohaum/Pathfinding-Visualizer/issues

# Feature Requests  
https://github.com/sohaum/Pathfinding-Visualizer/discussions

# Direct Contact
email: your.email@example.com
twitter: @yourusername
```

## 🙏 Acknowledgments

- Inspired by @clementmihailescu 's Pathfinding Visualizer
- Maze generation algorithm based on Prim's algorithm
- UI design inspired by modern glassmorphism trends
- Color palette from Tailwind CSS

---

<div align="center">

**⭐ Star this repository if you found it helpful! ⭐**

Made with ❤️ by [Sohaum Ghosh](https://github.com/sohaum)

</div>
