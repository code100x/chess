
import { Chess, Color, PieceSymbol, Square } from "chess.js";
import { MouseEvent, useEffect, useState } from "react";
import { IMove, MOVE } from "../screens/Game";
import LetterNotation from "./chess-board/LetterNotation";
import LegalMoveIndicator from "./chess-board/LegalMoveIndicator";
import ChessSquare from "./chess-board/ChessSquare";
import NumberNotation from "./chess-board/NumberNotation";
import { drawArrow } from "../utils/canvas";
import useWindowSize from "../hooks/useWindowSize";

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
    const { height, width } = useWindowSize();
    const [lastMoveFrom, lastMoveTo] = [moves?.at(-1)?.from || "", moves?.at(-1)?.to || ""];
    const [rightClickedSquares, setRightClickedSquares] = useState<string[]>([]);
    const [arrowStart, setArrowStart] = useState<string | null>(null);

    const [from, setFrom] = useState<null | Square>(null);
    const isMyTurn = myColor === chess.turn();
    const [legalMoves, setLegalMoves] = useState<string[]>([]);

    const labels = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const isFlipped = myColor === "b";
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
    const OFFSET = 100;
    const boxSize = width > height ? Math.floor((height - OFFSET) / 8) : Math.floor((width - OFFSET) / 8);

    const handleMouseDown = (e: MouseEvent<HTMLDivElement>, squareRep: string) => {
        e.preventDefault();
        if (e.button === 2) {
            setArrowStart(squareRep);
        }
    };

    const clearCanvas = () => {
        setRightClickedSquares([]);
        if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const handleRightClick = (squareRep:string) => {
        if (rightClickedSquares.includes(squareRep)) {
            setRightClickedSquares((prev) => prev.filter((sq) => sq !== squareRep));
        } else {
            setRightClickedSquares((prev) => [...prev, squareRep]);
        }
    }

    const handleDrawArrow = (squareRep: string) => {
        if (arrowStart) {
            const stoppedAtSquare = squareRep;
            if (canvas) {
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    drawArrow(ctx, arrowStart, stoppedAtSquare, isFlipped);
                }
            }
            setArrowStart(null);
        }
    }

    const handleMouseUp = (e: MouseEvent<HTMLDivElement>, squareRep: string) => {
        e.preventDefault();
        if (!started) {
            return;
        }
        if (e.button === 2) {
            if (arrowStart === squareRep) {
               handleRightClick(squareRep)
            } else {
                handleDrawArrow(squareRep)
            }
        } else {
            clearCanvas();
        }
    };
   
    useEffect(() => {
        clearCanvas();
    }, [moves]);

    return (
        <>
            <div className="flex relative">
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
                                    const isHighlightedSquare =
                                        from === squareRepresentation ||
                                        squareRepresentation === lastMoveFrom ||
                                        squareRepresentation === lastMoveTo;
                                    const isRightClickedSquare = rightClickedSquares.includes(squareRepresentation);

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
                                                        setMoves((moves) => [
                                                            ...moves,
                                                            { from, to: squareRepresentation },
                                                        ]);
                                                    } catch (e) {}
                                                }
                                            }}
                                            style={{
                                                width: boxSize,
                                                height: boxSize
                                            }}
                                            key={j}
                                            className={`${isRightClickedSquare ? (isMainBoxColor ? "bg-[#CF664E]" : "bg-[#E87764]") : isHighlightedSquare ? `${isMainBoxColor ? "bg-[#BBCB45]" : "bg-[#F4F687]"}` : isMainBoxColor ? "bg-[#739552]" : "bg-[#EBEDD0]"} ${""}`}
                                            onContextMenu={(e) => {
                                                e.preventDefault();
                                            }}
                                            onMouseDown={(e) => {
                                                handleMouseDown(e, squareRepresentation);
                                            }}
                                            onMouseUp={(e) => {
                                                handleMouseUp(e, squareRepresentation);
                                            }}
                                        >
                                            <div className="w-full justify-center flex h-full relative">
                                                {square && <ChessSquare square={square} />}
                                                {isFlipped
                                                    ? i === 8 && (
                                                          <LetterNotation
                                                              label={labels[j]}
                                                              isMainBoxColor={j % 2 !== 0}
                                                          />
                                                      )
                                                    : i === 1 && (
                                                          <LetterNotation
                                                              label={labels[j]}
                                                              isMainBoxColor={j % 2 !== 0}
                                                          />
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

                <canvas
                    ref={(ref) => setCanvas(ref)}
                    width={boxSize * 8}
                    height={boxSize * 8}
                    style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
                    onContextMenu={(e) => e.preventDefault()}
                    onMouseDown={(e) => {
                        e.preventDefault();
                    }}
                    onMouseUp={(e) => e.preventDefault()}
                ></canvas>
            </div>
        </>
    );
};
