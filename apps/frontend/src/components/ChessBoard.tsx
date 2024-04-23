import { Chess, Color, PieceSymbol, Square } from 'chess.js';
import { MouseEvent, useEffect, useState } from 'react';
import { IMove, MOVE } from '../screens/Game';
import LetterNotation from './chess-board/LetterNotation';
import LegalMoveIndicator from './chess-board/LegalMoveIndicator';
import ChessSquare from './chess-board/ChessSquare';
import NumberNotation from './chess-board/NumberNotation';
import { drawArrow } from '../utils/canvas';
import useWindowSize from '../hooks/useWindowSize';
import Confetti from 'react-confetti';
import MoveSound from '../../public/move.wav';
import CaptureSound from '../../public/capture.wav';

export function isPromoting(chess: Chess, from: Square, to: Square) {
    if (!from) {
        return false;
    }

    const piece = chess.get(from);

    if (piece?.type !== 'p') {
        return false;
    }

    if (piece.color !== chess.turn()) {
        return false;
    }

    if (!['1', '8'].some((it) => to.endsWith(it))) {
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
    const [lastMoveFrom, lastMoveTo] = [
        moves?.at(-1)?.from || '',
        moves?.at(-1)?.to || '',
    ];
    const [rightClickedSquares, setRightClickedSquares] = useState<string[]>([]);
    const [arrowStart, setArrowStart] = useState<string | null>(null);

    const [from, setFrom] = useState<null | Square>(null);
    const isMyTurn = myColor === chess.turn();
    const [legalMoves, setLegalMoves] = useState<string[]>([]);

    const labels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const isFlipped = myColor === 'b';
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
    const OFFSET = 100;
    const boxSize =
        width > height
            ? Math.floor((height - OFFSET) / 8)
            : Math.floor((width - OFFSET) / 8);
    const [gameOver, setGameOver] = useState(false);
    const moveAudio = new Audio(MoveSound);
    const captureAudio = new Audio(CaptureSound);

    const handleSquareClick = (squareRep: string) => {
        if (!started || !isMyTurn) return;

        if (from !== squareRep) {
            setFrom(squareRep);
            const isPiece = board.flat().some((piece) => piece?.square === squareRep);
            if (isPiece) {
                setLegalMoves(
                    chess
                        .moves({
                            verbose: true,
                            square: squareRep,
                        })
                        .map((move) => move.to),
                );
            } else {
                setLegalMoves([]);
            }
        } else {
            setFrom(null);
        }

        if (from) {
            try {
                let moveResult;
                if (isPromoting(chess, from, squareRep)) {
                    moveResult = chess.move({
                        from,
                        to: squareRep,
                        promotion: 'q',
                    });
                } else {
                    moveResult = chess.move({
                        from,
                        to: squareRep,
                    });
                }

                moveAudio.play();
                if (moveResult?.captured) {
                    captureAudio.play();
                }

                if (moveResult.san.includes('#')) {
                    setGameOver(true);
                }

                socket.send(
                    JSON.stringify({
                        type: MOVE,
                        payload: {
                            gameId,
                            move: {
                                from,
                                to: squareRep,
                            },
                        },
                    }),
                );

                setBoard(chess.board());

                const piece = chess.get(squareRep)?.type;
                setMoves((moves) => [...moves, { from, to: squareRep, piece }]);
            } catch (e) { }
        }
    };

    return (
        <>
            {gameOver && <Confetti />}
            <div className="flex relative">
                <div className="text-white-200 mr-10 rounded-md overflow-hidden">
                    {(isFlipped ? board.slice().reverse() : board).map((row, i) => {
                        i = isFlipped ? i + 1 : 8 - i;
                        return (
                            <div key={i} className="flex relative">
                                <NumberNotation
                                    isMainBoxColor={i % 2 === 0}
                                    label={i.toString()}
                                />
                                {(isFlipped ? row.slice().reverse() : row).map((square, j) => {
                                    j = isFlipped ? 7 - (j % 8) : j % 8;

                                    const isPiece: boolean = !!square;
                                    const isMainBoxColor = isFlipped
                                        ? (i + j) % 2 === 0
                                        : (i + j) % 2 !== 0;
                                    const squareRepresentation = (String.fromCharCode(97 + j) +
                                        '' +
                                        i) as Square;
                                    const isHighlightedSquare =
                                        (from === squareRepresentation ||
                                            squareRepresentation === lastMoveFrom ||
                                            squareRepresentation === lastMoveTo) &&
                                        isPiece;
                                    const isRightClickedSquare =
                                        rightClickedSquares.includes(squareRepresentation);

                                    return (
                                        <div
                                            onClick={() => handleSquareClick(squareRepresentation)}
                                            style={{
                                                width: boxSize,
                                                height: boxSize,
                                            }}
                                            key={j}
                                            className={`${isRightClickedSquare ? (isMainBoxColor ? 'bg-[#CF664E]' : 'bg-[#E87764]') : isHighlightedSquare ? `${isMainBoxColor ? 'bg-[#BBCB45]' : 'bg-[#F4F687]'}` : isMainBoxColor ? 'bg-[#739552]' : 'bg-[#EBEDD0]'} ${''}`}
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
                                                {!!from &&
                                                    legalMoves.includes(squareRepresentation) && (
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
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        pointerEvents: 'none',
                    }}
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
