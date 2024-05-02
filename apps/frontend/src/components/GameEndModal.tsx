import React, { useState } from 'react';
import WhiteKing from '../../public/wk.png';
import BlackKing from '../../public/bk.png';
import { GameResult } from '@/screens/Game';

interface ModalProps {
  blackPlayer?: { id: string; name: string };
  whitePlayer?: { id: string; name: string };
  gameResult: GameResult;
  onClose: () => void;
}

const GameEndModal: React.FC<ModalProps> = ({
  blackPlayer,
  whitePlayer,
  gameResult,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const closeModal = () => {
    setIsOpen(false);
    onClose();
  };

  const getPlayerName = (player: { id: string; name: string } | undefined) => {
    return player ? player.name : 'Unknown';
  };

  const getWinnerName = () => {
    if (gameResult.result === 'BLACK_WINS') {
      return getPlayerName(blackPlayer);
    } else if (gameResult.result === 'WHITE_WINS') {
      return getPlayerName(whitePlayer);
    } else {
      return 'Draw';
    }
  };

  return (
    <div>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 rounded">
          <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
          <div className="relative rounded-lg shadow-lg bg-gray-800 w-96">
            <div className="px-6 py-8 items-center self-center m-auto">
              <div className="m-auto mb-6">
                <h2 className={`text-4xl font-bold mb-2 text-yellow-400 text-center text-wrap`}>
                  {gameResult.result === 'BLACK_WINS' ? 'Black Wins!' : gameResult.result === 'DRAW' ? `It's a Draw` : 'White Wins!'}  
                </h2>
              </div>
              <div className="m-auto mb-6">
                <p className="text-xl text-white text-center">by {gameResult.by}</p>
              </div>
              <div className="flex flex-row justify-between items-center bg-gray-700 rounded-lg px-4 py-6">
                <div className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`border-4 rounded-full p-2 ${gameResult.result === 'WHITE_WINS' ? 'border-green-400' : 'border-red-400'} mr-4`}>
                      <img src={WhiteKing} alt="White King" className="w-10 h-10" />
                    </div>
                    <div className="text-center text-xm p-2">
                      <p className="text-white truncate w-24" title={getPlayerName(whitePlayer)}>{getPlayerName(whitePlayer)}</p>
                    </div>
                  </div>
                </div>
                <div className="text-white text-2xl font-bold">vs</div>
                <div className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`border-4 rounded-full p-2 ${gameResult.result === 'BLACK_WINS' ? 'border-green-400' : 'border-red-400'} ml-4`}>
                      <img src={BlackKing} alt="Black King" className="w-10 h-10" />
                    </div>
                    <div className="text-center text-xm p-2">
                        <p className="text-white truncate w-24" title={getPlayerName(blackPlayer)}>{getPlayerName(blackPlayer)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-900 text-right rounded-b-lg">
              <button
                className="px-6 py-3 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameEndModal;