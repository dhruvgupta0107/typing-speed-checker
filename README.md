# Typing Speed Checker

A full-stack web application for testing and improving typing speed with real-time feedback and global leaderboards.

## Features

- Real-time typing speed tests (30s and 1min modes)
- WPM and accuracy tracking
- Real-time visual feedback (green for correct, red for incorrect)
- JWT-based authentication
- Global leaderboard with real-time updates
- Responsive and accessible design

## Tech Stack

- Frontend: React, ShadCN, TailwindCSS
- Backend: Node.js, Express
- Database: MongoDB
- Real-time: Socket.IO

## Project Structure

```
typing-speed-checker/
├── frontend/          # React frontend application
├── backend/           # Node.js backend server
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a .env file with the following variables:

   ```
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a .env file with:

   ```
   VITE_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Register a new account or login
2. Choose between 30-second or 1-minute test
3. Type the displayed text
4. View your results and compare with the global leaderboard

## License

MIT
