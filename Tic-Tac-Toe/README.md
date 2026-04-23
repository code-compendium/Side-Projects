# Tic-Tac-Kombat

Welcome to **Tic-Tac-Kombat**, a Mortal Kombat inspired Tic-Tac-Toe game built with React and Vite. This isn't just your standard grid game. It's a battle for supremacy with immersive sounds, character selection, and high-stakes fatalities.

## Gameplay

The rules are simple, but the atmosphere is intense:

1. **Choose Your Fighter**: Player 1 (X) and Player 2 (O) must select their legendary combatant. Enter your name and confirm your choice to begin.
2. **The Grid of War**: Players take turns placing their symbols on a 3x3 grid. You have **10 seconds** per turn, or the turn will pass to your opponent!
3. **Winning the Round**: Align three of your symbols horizontally, vertically, or diagonally to win.
4. **FINISH THEM!**: Winning isn't enough. Upon victory, you enter the **Fatality Sequence**. You must enter a random 10-key combination within 10 seconds.
   - **Success**: You perform a Fatality and earn a point!
   - **Failure**: You fail the combo, and the game resets. Because you lacked discipline, the **other player starts the next round**!

## Features

- **Immersive Atmosphere**: Dynamic canvas-based smoke effects and blood-splatter overlays.
- **Iconic Characters**: Choose from Scorpion, Sub-Zero, Kitana, and more, each with their own signature colors.
- **Audio Experience**: Background music for the selection screen and battle phase, plus combat sound effects (Strikes, Fatality starts, and KO sounds).
- **Persistent Stats**: Wins, losses, and draws are saved in your browser's **LocalStorage**, so your glory (or shame) is never forgotten.
- **Responsive Design**: A sleek, dark UI that feels premium and stays centered during intense action.

## Tech Stack

- **React**: For the dynamic UI and state management.
- **Vite**: For a lightning-fast development experience.
- **Vanilla CSS**: Custom-crafted styles for the MK aesthetic.
- **Canvas API**: For high-performance background smoke effects.
- **Web Audio API**: For responsive sound triggers.

## Getting Started

To run this project locally:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
