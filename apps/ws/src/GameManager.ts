import { WebSocket } from "ws";
import { INIT_GAME, JOIN_GAME, MOVE, OPPONENT_DISCONNECTED } from "./messages";
import { Game } from "./Game";
import { db } from "./db";
import { SocketManager, User } from "./SocketManager";

export class GameManager {
    private games: Game[];
    private pendingGameId: string | null;
    private users: User[];

    constructor() {
        this.games = [];
        this.pendingGameId = null;
        this.users = [];
    }

    addUser(user: User) {
        this.users.push(user);
        this.addHandler(user)
    }

    removeUser(socket: WebSocket) {
        const user = this.users.find(user => user.socket !== socket);
        if (!user) {
            console.error("User not found?");
            return;
        }
        this.users = this.users.filter(user => user.socket !== socket);
        SocketManager.getInstance().removeUser(user)
    }

    private addHandler(user: User) {
        user.socket.on("message", async (data) => {
            const message = JSON.parse(data.toString());
            if (message.type === INIT_GAME) {
                if (this.pendingGameId) {
                    const game = this.games.find(x => x.gameId === this.pendingGameId);
                    if (!game) {
                        console.error("Pending game not found?")
                        return;
                    }
                    SocketManager.getInstance().addUser(user, game.gameId)
                    await game?.updateSecondPlayer(user.userId);
                    this.pendingGameId = null;
                } else {
                    const game = new Game(user.userId, null)
                    this.games.push(game);
                    this.pendingGameId = game.gameId;
                    SocketManager.getInstance().addUser(user, game.gameId)
                }
            }

            if (message.type === MOVE) {
                const gameId = message.payload.gameId;
                const game = this.games.find(game => game.gameId === gameId);
                if (game) {
                    game.makeMove(user, message.payload.move);
                }
            }

            // Todo
    //         if (message.type === JOIN_GAME) {
    //             if (message.payload?.gameId) {
    //                 const { payload: { gameId } } = message
    //                 const availableGame = this.games.find(game => game.gameId === gameId)
    //                 if (availableGame) {
    //                     const { player1, player2, gameId, board } = availableGame
    //                     if (player1 && player2) {
    //                         socket.send(JSON.stringify({ type: "GAME_FULL" }))
    //                         return;
    //                     }
    //                     if (!player1) {
    //                         availableGame.player1.socket = socket
    //                         player2?.socket.send(JSON.stringify({ type: "OPPONENT_JOINED" }))
    //                     }
    //                     else if (!player2) {
    //                         availableGame.player2.socket = socket
    //                         player1?.socket.send(JSON.stringify({ type: "OPPONENT_JOINED" }))
    //                     }
    //                     socket.send(JSON.stringify({
    //                         type: "GAME_JOINED",
    //                         payload: {
    //                             gameId,
    //                             board
    //                         }
    //                     }))
    //                     return
    //                 } else {
    //                     const gameFromDb = await db.game.findUnique({
    //                         where: { id: gameId, }, include: {
    //                             moves: {
    //                                 orderBy: {
    //                                     moveNumber: "asc"
    //                                 }
    //                             },
    //                         }
    //                     })
    //                     const game = new Game(socket, null);
    //                     gameFromDb?.moves.forEach((move) => {
    //                         game.board.move(move)
    //                     })
    //                     this.games.push(game);
    //                     socket.send(JSON.stringify({
    //                         type: "GAME_JOINED",
    //                         payload: {
    //                             gameId,
    //                             board: game.board
    //                         }
    //                     }))
    //                 }
    //             }
    //         }
        })
    }
}