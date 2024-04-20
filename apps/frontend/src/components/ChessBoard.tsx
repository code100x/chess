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
            <div className="text-white-200 mr-10 rounded-md overflow-hidden">
                {(isFlipped ? board.slice().reverse() : board).map((row, i) => {
                    i = isFlipped ? i + 1 : 8 - i;
                    return (
                        <div key={i} className="flex relative">
                            <div
                                className={`font-bold absolute ${i % 2 === 0 ? "text-[#739552]" : "text-[#EBEDD0]"} left-0.5`}
                            >
                                {i}
                            </div>

                            {(isFlipped ? row.slice().reverse() : row).map((square, j) => {
                                j = isFlipped ? 7 - (j % 8) : j % 8;

                                const isMainBoxColor = isFlipped ? (i + j) % 2 === 0 : (i + j) % 2 !== 0;
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
                                        className={`w-16 h-16  ${from === squareRepresentation ? `${isMainBoxColor? "bg-[#BBCB45]":"bg-[#F4F687]"}` : isMainBoxColor ? "bg-[#739552]" : "bg-[#EBEDD0]"}`}
                                    >
                                        <div className="w-full justify-center flex h-full relative">
                                            <div className="h-full justify-center flex flex-col ">
                                                {square ? (
                                                    <img
                                                        className="w-14"
                                                        src={`/${square?.color === "b" ? `b${square.type}` : `w${square.type}`}.png`}
                                                    />
                                                ) : null}
                                            </div>

                                            {isFlipped
                                                ? i === 8 && (
                                                      <div
                                                          className={`font-bold absolute ${j % 2 !== 0 ? "text-[#739552]" : "text-[#EBEDD0]"} right-0.5 bottom-0`}
                                                      >
                                                          {labels[j]}
                                                      </div>
                                                  )
                                                : i === 1 && (
                                                      <div
                                                          className={`font-bold absolute ${j % 2 !== 0 ? "text-[#739552]" : "text-[#EBEDD0]"} right-0.5 bottom-0`}
                                                      >
                                                          {labels[j]}
                                                      </div>
                                                  )}
                                            {!!from && legalMoves.includes(squareRepresentation) && (
                                                <div className="absolute z-[100] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                                    {square?.type ? (
                                                        <div className={`w-[60px] h-[60px] ${isMainBoxColor? "border-[#628047]":"border-[#C8CAB2]"} border-4 rounded-full`} />
                                                    ) : (
                                                        <div className={`w-5 h-5 ${isMainBoxColor? "bg-[#628047]":"bg-[#C8CAB2]"} rounded-full`} />
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
            </div>
        </div>
    );
};
