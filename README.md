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


## STEPS TO START LOCALLY 

1. yarn install
2. Add DATABASE_URL env varibale in apps/packages/db/prisma dir
3. cd apps/packages/db - run `yarn primsa migrate dev`
4. cd apps/frontend   - run `npm run dev`
5. cd apps/backend   - run `npm run dev`
6. You're All set
