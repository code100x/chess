import { Chess, Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { IMove, MOVE } from "../screens/Game";

export function isPromoting(chess: Chess, from: Square, to: Square) {
    if (!from) {
        return false;
    }

    const piece = chess.get(from);

    if (piece?.type !== "p") {
        return false;
    }

    if (piece.color !== chess.turn()) {
        return false;
    }

    if (!["1", "8"].some((it) => to.endsWith(it))) {
        return false;
    }

    return chess
        .moves({ square: from, verbose: true })
        .map((it) => it.to)
        .includes(to);
}

export const ChessBoard = ({
    gameId,
    started,
    myColor,
    chess,
    board,
    socket,
    setBoard,
    setMoves,
}: {
    myColor: Color;
    gameId: string;
    started: boolean;
    chess: Chess;
    moves: IMove[];
    setMoves: React.Dispatch<React.SetStateAction<IMove[]>>;
    setBoard: React.Dispatch<
        React.SetStateAction<
            ({
                square: Square;
                type: PieceSymbol;
                color: Color;
            } | null)[][]
        >
    >;
    board: ({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][];
    socket: WebSocket;
}) => {
    const [from, setFrom] = useState<null | Square>(null);
    const isMyTurn = myColor === chess.turn();
    const [legalMoves, setLegalMoves] = useState<string[]>([]);
    const labels = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const isFlipped = myColor === "b";

    return (
        <div className="flex">
            <div className="text-white-200 mr-10">
                {(isFlipped ? board.slice().reverse() : board).map((row, i) => {
                    i = isFlipped ? i + 1 : 8 - i;
                    return (
                        <div key={i} className="flex">
                            <div className="w-16 h-16 flex justify-center items-center text-cyan-100">
                                {i} {/* Vertical labels */}
                            </div>
                            {(isFlipped ? row.slice().reverse() : row).map((square, j) => {
                                j = isFlipped ? 7 - (j % 8) : j % 8;
                                const squareRepresentation = (String.fromCharCode(97 + j) + "" + i) as Square;
                                return (
                                    <div
                                        onClick={() => {
                                            if (!started) {
                                                return;
                                            }
                                            if (!from && square?.color !== chess.turn()) return;
                                            if (!isMyTurn) return;
                                            if (from === squareRepresentation) {
                                                setFrom(null);
                                            }

                                            if (!from) {
                                                setFrom(squareRepresentation);
                                                setLegalMoves(
                                                    chess
                                                        .moves({ verbose: true, square: square?.square })
                                                        .map((move) => move.to),
                                                );
                                            } else {
                                                try {
                                                    if (isPromoting(chess, from, squareRepresentation)) {
                                                        chess.move({
                                                            from,
                                                            to: squareRepresentation,
                                                            promotion: "q",
                                                        });
                                                    } else {
                                                        chess.move({
                                                            from,
                                                            to: squareRepresentation,
                                                        });
                                                    }
                                                    socket.send(
                                                        JSON.stringify({
                                                            type: MOVE,
                                                            payload: {
                                                                gameId,
                                                                move: {
                                                                    from,
                                                                    to: squareRepresentation,
                                                                },
                                                            },
                                                        }),
                                                    );
                                                    setFrom(null);
                                                    setLegalMoves([]);
                                                    setBoard(chess.board());
                                                    console.log({
                                                        from,
                                                        to: squareRepresentation,
                                                    });
                                                    setMoves((moves) => [...moves, { from, to: squareRepresentation }]);
                                                } catch (e) {}
                                            }
                                        }}
                                        key={j}
                                        className={`w-16 h-16  ${from === squareRepresentation ? "bg-red-500" : (i + j) % 2 === 0 ? "bg-green-500" : "bg-slate-500"}`}
                                    >
                                        <div className="w-full justify-center flex h-full relative">
                                            <div className="h-full justify-center flex flex-col ">
                                                {square ? (
                                                    <img
                                                        className="w-4"
                                                        src={`/${square?.color === "b" ? square?.type : `${square?.type?.toUpperCase()} copy`}.png`}
                                                    />
                                                ) : null}
                                            </div>
                                            {!!from && legalMoves.includes(squareRepresentation) && (
                                                <div className="absolute z-[100] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                                    {square?.type ? (
                                                        <div className="w-14 h-14 border-red-400 border-4 rounded-full" />
                                                    ) : (
                                                        <div className="w-3.5 h-3.5 bg-red-400 rounded-full" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
                <div className="flex">
                    <div className="w-16 h-8"></div>
                    {(isFlipped ? labels.slice().reverse() : labels).map((label, i) => (
                        <div key={i} className="w-16 h-8 flex justify-center items-center text-cyan-100">
                            {label} {/* Horizontal labels */}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
