import { Chess, Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { IMove, MOVE } from "../screens/Game";
import LetterNotation from "./chess-board/LetterNotation";
import LegalMoveIndicator from "./chess-board/LegalMoveIndicator";
import ChessSquare from "./chess-board/ChessSquare";
import NumberNotation from "./chess-board/NumberNotation";

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
    moves,
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
    const [lastMoveFrom, lastMoveTo] = [moves?.at(-1)?.from || "", moves?.at(-1)?.to || ""];


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
                            <NumberNotation isMainBoxColor={i % 2 === 0} label={i.toString()} />
                            {(isFlipped ? row.slice().reverse() : row).map((square, j) => {
                                j = isFlipped ? 7 - (j % 8) : j % 8;

                                const isMainBoxColor = isFlipped ? (i + j) % 2 === 0 : (i + j) % 2 !== 0;
                                const squareRepresentation = (String.fromCharCode(97 + j) + "" + i) as Square;
                                const isHighlightedSquare = from === squareRepresentation || squareRepresentation === lastMoveFrom || squareRepresentation === lastMoveTo
                            
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
                                        className={`w-16 h-16  ${isHighlightedSquare ? `${isMainBoxColor ? "bg-[#BBCB45]" : "bg-[#F4F687]"}` : isMainBoxColor ? "bg-[#739552]" : "bg-[#EBEDD0]"}`}
                                    >
                                        <div className="w-full justify-center flex h-full relative">
                                            {square && <ChessSquare square={square} />}

                                            {isFlipped
                                                ? i === 8 && (
                                                      <LetterNotation label={labels[j]} isMainBoxColor={j % 2 !== 0} />
                                                  )
                                                : i === 1 && (
                                                      <LetterNotation label={labels[j]} isMainBoxColor={j % 2 !== 0} />
                                                  )}
                                            {!!from && legalMoves.includes(squareRepresentation) && (
                                                <LegalMoveIndicator
                                                    isMainBoxColor={isMainBoxColor}
                                                    isPiece={!!square?.type}
                                                />
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
