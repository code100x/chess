import { WebSocket } from "ws";
import { INIT_GAME, JOIN_GAME, MOVE, OPPONENT_DISCONNECTED, JOIN_ROOM, GAME_JOINED, GAME_NOT_FOUND, MATCH_NOT_FOUND } from "./messages";
import { Game, isPromoting } from "./Game";
import { db } from "./db";
import { SocketManager, User } from "./SocketManager";
import { Square } from "chess.js";

export class GameManager {
    private games: Game[];
    private pendingGameId: string | null;
    private users: User[];

    constructor() {
        this.games = [];
        this.pendingGameId = null;
        this.users = [];
    }

    checkMatchMaking(user: User) {
        setTimeout(() => {
            let game = this.games.find((g) => {
                return g.player1UserId == user.userId || g.player2UserId == user.userId
            }) as Game

            if (!game) {
                user.socket.send(JSON.stringify({
                    type: MATCH_NOT_FOUND
                }))
            } else {
                const currentTime = new Date();
                if ((currentTime.getTime() - game.startTime.getTime()) > 20000 && (game.player2UserId == undefined)) {
                    this.games = this.games.filter((game) => !(game.gameId == this.pendingGameId))
                    this.pendingGameId = null
                    user.socket.send(JSON.stringify({
                        type: MATCH_NOT_FOUND
                    }))
                    console.log("Match--not found")
                }
            }
        }, 20000)
    }

    addUser(user: User) {
        let u = this.users.find((v) => v.userId == user.userId)
        if (!u) {
            this.users.push(user);
        }
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
                    this.checkMatchMaking(user)
                }
            }

            if (message.type === MOVE) {
                const gameId = message.payload.gameId;
                const game = this.games.find(game => game.gameId === gameId);
                if (game) {
                    game.makeMove(user, message.payload.move);
                }
            }

            if (message.type === JOIN_ROOM) {
                const gameId = message.payload?.gameId;
                if (!gameId) {
                    return;
                }

                const availableGame = this.games.find(game => game.gameId === gameId)
                const gameFromDb = await db.game.findUnique({
                    where: { id: gameId, }, include: {
                        moves: {
                            orderBy: {
                                moveNumber: "asc"
                            }
                        },
                        blackPlayer: true,
                        whitePlayer: true,
                    }
                })
                if (!gameFromDb) {

                    user.socket.send(JSON.stringify({
                        type: GAME_NOT_FOUND
                    }));
                    return;
                }

                if (!availableGame) {
                    const game = new Game(gameFromDb?.whitePlayerId!, gameFromDb?.blackPlayerId!);
                    gameFromDb?.moves.forEach((move) => {
                        if (isPromoting(game.board, move.from as Square, move.to as Square)) {
                            game.board.move({
                                from: move.from,
                                to: move.to,
                                promotion: 'q'
                            });
                        } else {
                            game.board.move({
                                from: move.from,
                                to: move.to,
                            });
                        }
                    });
                    this.games.push(game);
                }

                user.socket.send(JSON.stringify({
                    type: GAME_JOINED,
                    payload: {
                        gameId,
                        moves: gameFromDb.moves,
                        blackPlayer: {
                            id: gameFromDb.blackPlayer.id,
                            name: gameFromDb.blackPlayer.name,
                        },
                        whitePlayer: {
                            id: gameFromDb.whitePlayer.id,
                            name: gameFromDb.whitePlayer.name,
                        }
                    }
                }));

                SocketManager.getInstance().addUser(user, gameId)
            }
        })
    }
}