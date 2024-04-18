import { WebSocket } from "ws";
import { INIT_GAME, MOVE } from "./messages";
import { Game } from "./Game";

// User, Game

export class GameManager {
    private games: Game[];
    private pendingUser: WebSocket | null;
    private users: WebSocket[];

    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.users = [];
    }

    addUser(socket: WebSocket) {
        this.users.push(socket);
        this.addHandler(socket)
    }

    removeUser(socket: WebSocket) {
        console.log("inside removeuser")
        this.users = this.users.filter(user => user !== socket);
        // Stop the game here because the user left
        const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
        if (game) {
            this.removeGame(game);
        }
    }

    removeGame(game: Game) {
        this.games = this.games.filter(g => g.player1 !== game.player1 && g.player2 !== game.player2);
    }

    private addHandler(socket: WebSocket) {
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString());

            if (message.type === INIT_GAME) {
                console.log("inside initgame")
                if (this.pendingUser) {
                    const game = new Game(this.pendingUser, socket);
                    this.games.push(game);
                    this.pendingUser = null;
                } else {
                    this.pendingUser = socket;
                }
            }

            if (message.type === MOVE) {
                console.log("inside move")
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if (game) {
                    console.log("inside makemove")
                    game.makeMove(socket, message.payload.move);
                    game.clearTimer();
                    const timer = setTimeout(() => {
                        console.log("inside timeout")
                        const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                        if (game) {
                            console.log("inside gameover")
                            game.gameOver(socket);
                            this.removeGame(game);
                        }
                    },60000)
                    game.setTimer(timer);
                }
            }
        })
    }
}