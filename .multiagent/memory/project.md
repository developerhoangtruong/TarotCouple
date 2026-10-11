# Project Overview & Architecture

## Tech Stack
- **Core Runtime**: Node.js, TypeScript
- **UI Framework**: React 19 / Vite, Vanilla CSS Design System with Glassmorphism
- **Realtime Server**: Node.js, Express, Socket.io (Port 3001), JWT Handshake Auth
- **Audio Engine**: Web Audio API Sound Synthesizer (Zero asset dependency)
- **State Management**: Zustand (`userStore`, `gameStore`) with LocalStorage fallback
- **Social Auth**: Google & Facebook OAuth integration with high-res Unsplash avatars
- **Testing Framework**: Vitest (42 tests passing across 10 test files)
- **Icons**: Lucide React + Official Brand SVGs

## Architecture Layers
- `src/core/`: Zero-dependency, pure FIDE chess logic (Board, Pieces, Legal Moves, Special Rules, FEN).
- `src/ai/`: Evaluator with Piece-Square Tables (PST) and Minimax Alpha-Beta search.
- `server/`: Server-Authoritative game rooms, FIDE Elo rating ($K=32$), and Matchmaking Queue ($\pm 150$).
- `src/ui/`, `src/pages/`, `src/components/`: Interactive React components with Glassmorphism theme, move history, clocks, promotion modal.
- `tests/`: Automated unit & integration tests covering moves, matchmaking, realtime security, and social auth.

## Key Commands
- Dev Server: `npm run dev` (Port 5173)
- Realtime Server: `npm run server` (Port 3001)
- Run Tests: `npm test` or `npx vitest run`
- Build App: `npm run build`
