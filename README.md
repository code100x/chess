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
4. Separate Websocket servers for handling real time games
5. Redis for storing all moves of a game in a queue

## Setting it up locally

 - Clone the repo
 - Copy over .env.example over to .env everywhere
 - Update .env
    - Postgres DB Credentials
    - Github/Google Auth credentials
 - npm install
 - Start ws server
    - cd apps/ws
    - npm run dev
 - Start Backend
    - cd apps/backend
    - npm run dev
 - Start frontend
    - cd apps/frontend
    - npm run dev

