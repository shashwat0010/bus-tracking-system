# 🚌 Bus Tracking System

A premium, real-time bus tracking application featuring a modern glassmorphism UI, dynamic simulation engine, and live data broadcasting.

![Final Dashboard](C:/Users/tshas/.gemini/antigravity/brain/1cfe9981-18e8-4949-bf45-4e6d66025eff/map_fix_final_1767280475188.png)

## ✨ Features

- **Premium UI/UX**: Sleek dark-themed dashboard with glassmorphism effects and modern typography.
- **Dynamic Simulation**: Realistic bus movement with variable speeds (20-60 km/h).
- **Occupancy Tracking**: Live simulation of passengers boarding and alighting at stops.
- **Interactive Mapping**: Leaflet-based map with custom bus markers, animated pulses, and static bus stop indicators.
- **Real-time Updates**: Instant location and stat updates via Socket.io and Kafka.
- **Search & Filter**: Quickly find specific buses or routes through the sidebar.

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript, Vite, Leaflet, Socket.io-client.
- **Backend**: Node.js, Express, TypeORM, Socket.io, KafkaJS.
- **Infrastructure**: Kafka (Zookeeper), Redis, PostgreSQL + PostGIS (Docker).

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/shashwat0010/bus-tracking-system.git
   cd bus-tracking-system
   ```

2. **Start Infrastructure**:
   ```bash
   docker-compose up -d
   ```

3. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Create .env based on the provided environment variables
   npm run dev
   ```

4. **Simulator Setup**:
   ```bash
   cd backend
   npm run simulator
   ```

5. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## 📍 Coordinates
The system is currently centered on **Bengaluru, India**, providing a realistic tracking experience for major routes like Majestic to Indiranagar and Silk Board.

## 📄 License
This project is for demonstration purposes.
