<h1 align='center'>Chess Platform</h1>

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



## Setup

### Using Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/chess.git
   ```

2. **Navigate to the project directory**
   ```bash
   cd chess
   ```

3. **Build and start the Docker containers**
   ```bash
   docker-compose up --build
   ```

## Usage

### Accessing the Services

Once the Docker containers are up and running, the services can be accessed at the following URLs:

- **Backend:** http://localhost:3000
- **Frontend:** http://localhost:5173
- **WebSocket Server:** ws://localhost:8080

### Stopping and Removing Containers

To stop the containers, use:
```bash
Ctrl+C
```
in the terminal where the containers are running.

To remove the containers and clean up:
```bash
docker-compose down
```

### Making Changes and Rebuilding

If you make changes to the source code and want to see these reflected:
1. Make your changes.
2. Rebuild the Docker images and restart the containers:
   ```bash
   docker-compose up --build
   ```

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. **Fork the Project**
2. **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the Branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**
