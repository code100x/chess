import React, { useCallback, useEffect, useState } from 'react';
import * as engine from '../../helper/BotEngine';
import BotChessBoard from './BotChessBoard';
import BotMoveTable from './BotMoveTable';
import type { SelectedBot } from './BotSelector';
import type { AvailableBots } from '../../helper/Bots';
import BotSelector from './BotSelector';

const BotGame: React.FC<{
  bots: AvailableBots;
  onGameCompleted: (winner: engine.GameWinner) => void;
}> = ({ bots, onGameCompleted }) => {
  const [isPlaying, setPlaying] = useState<boolean>(false);
  const [fen, setFen] = useState<engine.Fen>(engine.newGame);
  const [history, setHistory] = useState<Array<engine.Move>>([]);
  const [White] = useState<SelectedBot>(null);
  const [blackBot, setBlackBot] = useState<SelectedBot>(null);
  const [squareStyles , setSquareStyles] = useState({});


  const newGame = () => {
    setPlaying(false);
    setFen(engine.newGame);
    setHistory([]);
  };

  const squareStyling = ( pieceSquare:string, history:Array<engine.Move>) => {
    const sourceSquare = history.length && history[history.length -1].from;
    const targetSquare = history.length && history[history.length -1].to;
  
    return {
      [pieceSquare]: { backgroundColor: "rgba(255, 255, 0, 0.4)" },
      ...(history.length && {
        [sourceSquare]: {
          backgroundColor: "rgba(255, 255, 0, 0.4)",
        },
      }),
      ...(history.length && {
        [targetSquare]: {
          backgroundColor: "rgba(255, 255, 0, 0.4)",
        },
      }),
    };
  };

  const highlightSquare = (sourceSquare:engine.Square, squaresToHighlight:string[], history:Array<engine.Move> , pieceSquare :string) => {
    const highlightStyles: React.CSSProperties = [sourceSquare, ...squaresToHighlight].reduce(
      (a, c) => {
        return {
          ...a,
          ...{
            [c]: {
              background:
                "radial-gradient(circle, rgb(191, 188, 180) 36%, transparent 40%)",
              borderRadius: "50%",
            },
          },
          ...squareStyling(pieceSquare, history),
        };
      },
      {} as React.CSSProperties,
    );
    setSquareStyles({ ...squareStyles, ...highlightStyles });
  };

  const  onSquareClick = (square : engine.Square) => {
    const moves = engine.getPossibleMoves(fen, square);
    if (moves.length === 0) return;

    const squaresToHighlight = [];
    for (let i = 0; i < moves.length; i++) {
      squaresToHighlight.push(moves[i].to);
    }

    highlightSquare(square, squaresToHighlight , history , engine.getPiece(fen , square));
  };

  const removeHighlight = ( pieceSquare: engine.Square) => {
      setSquareStyles(squareStyling(pieceSquare, history));
  };

  const onMouseOutSquare = (square : engine.Square) => {
        removeHighlight(square);
  };

  const doMove = useCallback(
    (fen: engine.Fen, from: engine.Square, to: engine.Square) => {
      const move = engine.move(fen, from, to);

      if (!move) {
        return;
      }

      const [newFen, action] = move;

      if (engine.isGameOver(newFen)) {
        onGameCompleted(engine.getGameWinner(newFen));
        newGame();
        return;
      }

      setFen(newFen);
      setHistory((history) => [...history, action]);
      setSquareStyles(squareStyling(action.from, history)); 

    },
    [onGameCompleted],
  );

  const onMovePiece = ( sourceSquare: engine.Square, targetSquare: engine.Square  ) => {
    if (!isPlaying) {
      return false;
    }

    const move = engine.move(fen, sourceSquare, targetSquare);

      if (!move) {
        return false;
      }
      doMove(fen, sourceSquare, targetSquare);

      return true;
  };

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    if (engine.getGameWinner(fen)) {
      window.alert(
        `${engine.getGameWinner(fen) === 'b' ? 'Black' : engine.getGameWinner(fen) === 'w' ? 'White' : 'No one'} is the winner!`,
      );
      newGame();
      return;
    }

    let isBotMovePlayable = true;


    if (blackBot && engine.isBlackTurn(fen)) {
      blackBot.move(fen).then(({ from, to }: engine.ShortMove) => {
        if (isBotMovePlayable) doMove(fen, from, to);
      });
    }

    return () => {
      isBotMovePlayable = false;
    };
  }, [isPlaying, fen, White, blackBot, doMove]);

  return (
    <>
        <div className="flex ml-[5.3rem] gap-4">
            <img className="w-10 h-10 rounded" src={blackBot?.avatar} alt="" />
            <div className="font-medium dark:text-white text-white">
              <div>{blackBot?.name}</div>
            </div>
        </div>

        <div className="min-w-[750px] absolute flex-row right-0 no-scrollbar">
          <div className={'float-left ml-[16vw] mt-[2vh] '}>
            <BotChessBoard
              fen={fen}
              onMovePiece={onMovePiece}
              Bot={blackBot}
              onSquareClick={onSquareClick}
              onMouseOutSquare={onMouseOutSquare}
              customSquareStyles={squareStyles}
            />
          </div>

          <div className=" bg-[#242120] mt-0 rounded-lg ml-[64vw] mr-[10vw] h-[74vh] overflow-scroll no-scrollbar no-scrollbar">
            {isPlaying ? (
              <BotMoveTable history={history} />
            ) : (
              <>
                <div className="items-center flex flex-col flex-shrink-0 py-[0.8rem]  px-[3.5rem]">
                  <div className="font-bold mb-[0.5rem] text-white text-xl">
                    {' '}
                    Play Vs..
                  </div>
                  <div className="flex mt-[0.6rem]">
                    <img
                      height="100"
                      width="100"
                      alt="Ian"
                      className=" h-[8rem] overflow-hidden w-[8rem] rounded-lg"
                      src={blackBot?.avatar}
                    />
                  </div>
                  <div className="text-white mt-[0.5rem] text-base overflow-hidden whitespace-nowrap">
                    {blackBot?.name}
                  </div>
                  <div className="flex flex-col  items-center">
                    <span className="text-center text-gray-300 text-sm">
                      {blackBot?.description}
                    </span>
                  </div>
                </div>
                <div className="absolute top-[50%]">
                  <div className="text-sm mx-0 mt-0 mb-[0.7rem] text-white text-center uppercase">
                    <span>Top Players</span>
                  </div>

                  <BotSelector
                    availableBots={bots}
                    selectedBot={blackBot}
                    setSelectedBot={setBlackBot}
                  />
                </div>
              </>
            )}
            
          
          </div>

          <div className=" bg-[#242120] mt-2 rounded-lg ml-[64vw] mr-[10vw] flex space-x-4  overflow-scroll no-scrollbar">
            {!isPlaying ? (
              
                <button
                  className={
                    'px-36 py-4 text-2xl bg-green-500  font-bold rounded ml-[1rem] flex my-[1rem] m-[8px]  text-white'
                  }
                  onClick={() => setPlaying((playing) => !playing)}
                >
                  Play
                </button>
              
            ) : (
              <button
                className={
                  'px-36 py-4 text-2xl bg-gray-500  font-bold rounded ml-[1rem] flex my-[1rem] m-[8px]  text-white'
                }
                onClick={newGame}
              >
                Quit
              </button>
            )}
          </div>
        </div>
    </>
  );
};

export default BotGame;
