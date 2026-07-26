# 🛠️ Interactive System Design & LLD Playground

An advanced, decoupled visual modeling suite designed to bridge **High-Level Design (HLD) Topologies** with **Low-Level Design (LLD) UML Configurations**.

Featuring a live multi-language object-oriented code compiler, an interactive design patterns catalog, and a real-time system request latency simulation engine.

👉 **Live Local URL:** [http://localhost:3000](http://localhost:3000)

---

## 🌟 Key Features

### 1. 📐 Low-Level Design (LLD) UML Class Modeller
*   **Visual UML Editor:** Drag, drop, and configure standard UML Class boxes. Customize modifiers like `«Interface»` and `«Abstract»` classes.
*   **Encapsulation Modifiers:** Configure internal class properties (Attributes) and operations (Methods) with visibility tags (`+` for public, `-` for private, `#` for protected).
*   **Standardized Connectors:** Model OOP relationships visually using standard UML notations:
    *   **Inheritance (`extends`)**: Solid line, hollow closed arrowhead (`───▷`). Represents an *"Is-A"* relationship with superclass structural inheritance.
    *   **Simple Association**: Solid line, open arrowhead (`───>`). Represents a *"Knows-A" / "Uses-A"* peer connection without lifecycle ownership.
    *   **Aggregation Association**: Solid line, hollow diamond (`◇───`). Represents a *"Weak Has-A"* whole-part relationship where contained components can exist independently.
    *   **Composition Association**: Solid line, filled diamond (`◆───`). Represents a *"Strong Has-A"* whole-part relationship with exclusive parent lifecycle ownership.
    *   **Realization / Dependency**: Dashed line with hollow (`- - -▷`) or open (`- - ->`) arrowheads representing contract implementation (`implements`) or transient method usage.


### 2. ⚡ Live Multi-Language OOP Compiler
*   As you design UML relationships and classes on the canvas, a reactive bottom drawer **transpiles your visual models in real-time**!
*   Supports one-click language tabs with fully formed, syntactically precise syntax for:
    *   **C++**
    *   **Java**
    *   **TypeScript**
    *   **Python**
*   Includes built-in single-click "Copy Code" capability.

### 📚 3. Interactive Design Patterns Catalog (UML + SOLID)
*   Instantiate fully structured, educational UML diagram presets for classic design patterns:
    *   **Singleton (Creational):** Restricts instantiation to a single unique object (e.g. database connection pool). Shows private constructors and static accessors.
    *   **Factory Method (Creational):** Decouples client systems from instantiating low-level products using abstract factory contracts.
    *   **Strategy (Behavioral):** Encapsulates interchangeable algorithms (e.g. Credit Card vs PayPal payments) communicating dynamically at runtime.
    *   **Observer (Behavioral):** A one-to-many subscription dispatcher notifying subscribers automatically when publishers change state.
*   **SOLID Principles Inspector:** View detailed mathematical analyses explaining exactly which SOLID principles (such as OCP and DIP) are demonstrated by each pattern.

### 4. ⚖️ High-Level Design (HLD) Topology Simulator
*   Drag and drop real-world system infrastructure nodes: **Load Balancers, App Servers, Distributed Caches, and Relational Databases**.
*   Connect nodes and configure operational knobs (e.g. Server Processing Time, Cache Hit Rate, DB Read/Write Latency).
*   **Backend Simulation Engine:** Send your topology layout to a custom graph-traversal Node/Express API to simulate request routing, evaluate bottlenecks, track Cache Hits/Misses, handle network cycles, and output aggregate latency paths.

---

## ⚙️ Tech Stack

Your application is built using a modern, performant, and type-safe decoupled architecture:

*   **Frontend UI:** Next.js 16 (Turbopack) & React 19 (TypeScript) for robust, modular client state.
*   **Grid Workspace:** React Flow (`@xyflow/react`) for canvas grid renders, handles, drag-and-drop operations, and custom SVG overlays.
*   **Styling & Theme:** Vanilla TailwindCSS & custom HSL dark-mode CSS variables for a premium, glassmorphic look.
*   **Backend Simulator:** Node.js & Express hosting a RESTful graph traversal simulator using ES Modules.

---

## 📁 File Structure

```text
├── backend/                  # Node.js/Express Simulation Microservice
│   ├── server.js             # API route handlers & middleware
│   ├── simulator.js          # Adjacency list & request simulation algorithm
│   └── package.json
│
├── src/
│   ├── app/                  # Next.js App Router (Layout & Mode Switcher)
│   ├── components/
│   │   ├── nodes/            # Custom React Flow Uml & Hld Node cards
│   │   ├── edges/            # Custom UML relationship markers
│   │   ├── Sidebar.tsx       # Component palette & Design Patterns Catalog
│   │   ├── ConfigPanel.tsx   # Property editor & SOLID inspector
│   │   └── CodePanel.tsx     # bottom dynamic code viewer
│   │
│   ├── utils/
│   │   └── CodeGenerator.ts  # UML-to-Code Compiler engine
│   │
│   ├── types/
│   │   ├── nodes.ts          # HLD node TypeScript schemas
│   │   └── uml.ts            # LLD class diagram schemas
│   │
│   └── data/
│       ├── componentPalette.ts
│       └── DesignPatternCatalog.ts  # Presets templates & SOLID facts
```

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or higher recommended)
*   npm

### Installation & Execution
Clone the repository and run the concurrently configured developer environment to spin up both servers with one command:

```bash
# 1. Install dependencies
npm install

# 2. Run developer environment
npm run dev
```

*   **Frontend Client:** Open [http://localhost:3000](http://localhost:3000)
*   **Backend Simulation Service:** Runs on [http://localhost:3001](http://localhost:3001)

---

## 🎓 Presenting this Project in Interviews

This project represents high-fidelity frontend engineering and robust data structures. If you are discussing it in an interview, focus on:

*   **Decoupled microservice approach:** Explain how separating heavy computational traversals into an Express API leaves your React UI fluid and high-performing.
*   **Reactive State Architecture:** Explain how you solved React's reference stale-state limitations by dynamically memoizing selections directly from your canvas store, making your visual diagram editors reactive and fluid.
*   **Data Structures mastery:** Explain how the backend models your visual connections as an **Adjacency List** graph to perform topological steps, detect network loops, and calculate cumulative performance boundaries.
