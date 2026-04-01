# App-Reflex-Game 🎯

**Reflex Games** is a high-performance interactive Single Page Application (SPA) designed for cognitive training and e-sports skill development. It centralizes a suite of mini-games to evaluate and improve key human metrics.

## 🛠️ Tech Stack
* **Core:** React v19 + Vite.
* **Styling:** Tailwind CSS v4.
* **Animations:** Framer Motion v12.
* **Icons & Analytics:** Lucide-react & Recharts.

---

## ⚙️ Technical Deep Dive & Problem Solving

### 1. DOM Physics & Geometric Clamping
In the **Tracking Aim** game, I implemented a "cage" solution to handle boundary physics. 
* **The Challenge:** Handling complex math interpolations for target clipping at high refresh rates.
* **The Solution:** Delegated boundary logic to the **DOM Box Model** using an `absolute inset-[30px]` container, ensuring the target stays within the frame without heavy JS overhead.

### 2. UI Rendering Decoupling
Refactored the navigation (`BackButton`) to operate independently of the game's **Finite-State Machine**. This ensures the user always has an "Emergency Exit" (Nielsen’s Heuristics), regardless of the game’s internal state.

### 3. State-Phase Integrity
Implemented strict phase-filtering to prevent score exploits and ensure modularity through custom hooks like `useGameFeel` and `useStreak`.

---

## 🚀 Development Note
Developed using an **AI-augmented workflow** (Claude Code/Gemini) to brainstorm architectural patterns and optimize DOM physics.

## 💻 How to run
1. `npm install`
2. `npm run dev`
