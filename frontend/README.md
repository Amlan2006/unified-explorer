# Unified EVM Explorer - Frontend

Modern React frontend for searching tokens and contracts across all EVM chains.

## Features

- 🎨 Beautiful gradient UI with smooth animations
- 🔍 Real-time search across multiple chains
- 📱 Fully responsive design
- 🎯 Smart search detection (address/name/symbol)
- 📋 Copy-to-clipboard functionality
- 🔗 Direct links to chain explorers
- ⚡ Fast parallel searches

## Quick Start

```bash
cd unified-explorer/frontend
npm install
npm run dev
```

Open http://localhost:3000

## Build for Production

```bash
npm run build
npm run preview
```

## Tech Stack

- React 18
- TypeScript
- Vite
- Ethers.js v6
- CSS3 (Gradients & Animations)

## Usage

1. Enter a search query:
   - Token symbol (e.g., USDT)
   - Token name (e.g., Tether)
   - Contract address (0x...)

2. Click Search or press Enter

3. View results across all chains with:
   - Contract/wallet type
   - Balance information
   - Token details (if applicable)
   - Direct explorer links

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── SearchBar.tsx
│   │   ├── ResultsDisplay.tsx
│   │   ├── ResultCard.tsx
│   │   └── ChainList.tsx
│   ├── lib/
│   │   ├── UnifiedExplorer.ts
│   │   └── chains.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts
├── index.html
└── package.json
```
