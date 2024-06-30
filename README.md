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

1. Fork and clone the repo

```bash
git clone https://github.com/your-username/chess.git
```

2. Copy over .env.example over to .env everywhere

```bash
cp apps/backend/.env.example apps/backend/.env && cp apps/frontend/.env.example apps/frontend/.env
```

3. Update .env

- Postgres DB Credentials
- Github/Google Auth credentials

4. Install dependencies

```bash
npm install
```

5. Start ws server

```bash
cd apps/ws
npm run dev
```

6. Start Backend

```bash
cd apps/backend
npm run dev
```

7. Start frontend

```bash
cd apps/frontend
npm run dev
```

## Contributing

We welcome contributions from the community! To contribute to chess, follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/fooBar`).
3. Make your changes and commit them (`git commit -am 'Add some fooBar'`).
   > Make sure to lint and format your code before commiting
   >
   > - `npm run lint` to check for lint errors
   > - `npm run format` to fix lint errors
4. Push to the branch (`git push origin feature/fooBar`).
5. Create a new Pull Request.

For major changes, please open an issue first to discuss what you would like to change.

Read our [contribution guidelines](./CONTRIBUTING.md) for more details.
