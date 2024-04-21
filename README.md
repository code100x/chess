## Chess

Welcome to the Chess Repository! This platform allows users to sign up, create new matches, get connected to existing matches, and play real-time chess games.

## Installation

To get started, follow these steps:

1. Clone this repository to your local machine:
```bash
git clone https://github.com/code100x/chess
```

2. Navigate to the project directory:
```bash
cd chess
```

3. Install dependencies for both frontend and backend:
```bash
cd frontend
npm install
cd ../backend
npm install
```

These commands install all the necessary dependencies required to run both the frontend and backend of the Chess Platform.

## Usage

Once you have installed the dependencies, you can start the servers by running the following command in separate terminal windows:

For frontend:
```bash
cd frontend
npm run dev
```

For backend:
```bash
cd backend
npm run dev
```

These commands build the TypeScript files and starts the backend server. It's configured to automatically rebuild the code whenever changes are made, making it suitable for development.

After starting the servers, open your browser and go to [http://localhost:5173](http://localhost:5173) to access the Chess Platform.

## Tech Stack

The Chess Platform uses the following technologies:

- React for Frontend
- Node.js for Backend
- TypeScript as the language
- Separate WebSocket servers for handling real-time games
- Redis for storing all moves of a game in a queue

## Deployment

The Chess Platform is deployed and accessible at [chess.100xdevs.com](http://chess.100xdevs.com/). Visit the deployed version to play chess matches online!

## Contributing

Contributions are welcome! Please follow the contribution guidelines to contribute to this project.
