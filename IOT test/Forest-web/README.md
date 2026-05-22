# Forest Sentinel AI

A futuristic React dashboard for the AI Powered Smart Forest Fire and Wildlife Monitoring System.

## Stack
- React + TypeScript
- Vite
- Tailwind CSS
- Firebase Realtime Database
- Framer Motion
- Recharts
- React Icons
- React Toastify

## Run locally
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and add your Firebase Realtime Database credentials.
3. Start the app: `npm run dev`

## Firebase paths
- `/forest/temperature`
- `/forest/fireStatus`
- `/forest/animalDetection`
- `/forest/smoke`
- `/forest/alerts`

If Firebase is not configured, the dashboard falls back to a local realtime simulation.
