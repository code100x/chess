import React, { useState, useEffect } from 'react';
import { Square, Chess } from 'chess.js';
import { FaChessBishop, FaChessKing, FaChessKnight, FaChessQueen, FaChessRook } from 'react-icons/fa';
import { GiChessBishop } from 'react-icons/gi';

const chess = new Chess();
interface Move {
  from: Square;
  to: Square;
  type: string;
}

interface MovesTableProps {
  moves: Move[];
}

const MovesTable: React.FC<MovesTableProps> = ({ moves }) => {
  const [movesData, setMovesData] = useState<Move[]>([]);

  useEffect(() => {
    setMovesData(moves);
  }, [moves]);

  return (
    <div className="bg-black  ">
      <div className="bg-brown-600 rounded shadow mb-20 ">
        <h2 className="text-lg font-bold mb-4 text-white text-center pt-2 ">
          Moves Table
        </h2>
        <div className="overflow-x-auto ">
          <table className="w-full border-collapse  ">
            <thead>
              <tr className='border-hidden'>
              <th className="px-5 py-2 bg-brown-500 text-white border-hidden">
                 { ' '}
                </th>
                <th className="p-0 m-0 bg-brown-500 text-white border-hidden ">
                  {' '}
                </th>
              <th className="px-4 py-2 bg-brown-500 text-white border-hidden ">
                  From
                </th>
                <th className="px-5 py-2 bg-brown-500 text-white border-hidden ">
                  To
                </th>

              </tr>
            </thead>
            <tbody>
              {movesData.map((move, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? 'bg-brown-100' : 'bg-brown-500'}
                >
                  <td className="px-10 py-2 text-white border-hidden ">
                    {index+1}.
                  </td>
                  <td className="px-2 m-0 text-white border-hidden ">
                    {pieceTypeImage(chess.get(move.from)?.type)}
                  </td>
                  <td className="pl-1 py-2 text-white border-hidden ">
                      {move.from } 
                  </td>
                  <td className="px-10 py-2 text-white border-hidden ">
                    {move.to}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function pieceTypeImage (piece: string | undefined) {
  if (piece === 'p') {
    return '';
  }
  if (piece === 'r') {
    return <FaChessRook />;
  }
  if (piece === 'n') {
    return <FaChessKnight />;
  }
  if (piece === 'b') {
    return <FaChessBishop />;
  }
  if (piece === 'q') {
    return <FaChessQueen />;
  }
  if (piece === 'k') {
    return <FaChessKing />;
  }
  return '♙';
}

export default MovesTable;
