## Chess

Building a platform where people can

1. Sign up
2. Create a new match/get connected to an existing match
3. During the match, let users play moves
4. Have a rating system that goes up and down similar to standard chess rating

## Tech stack

Let's keep it simple

1. React for Frontend
2. Node.js for Backend
3. Typescript as the language
4. Saparate Websocket servers for handling real time games
5. Redis for storing all moves of a game in a queue

## How to run

1. Fork the repo
2. Clone the repo
3. Run `cd chess`

### Frontend

1. Run `cd frontend`
2. Run `npm install`
3. Run `cp .env.example .env`
4. Add the required environment variables in the `.env` file
5. Run `npm run dev`

### Backend

1. Run `cd backend`
2. Run `npm install`
3. Run `cp .env.example .env`
4. Add the required environment variables in the `.env` file
5. Run `npm run dev`
