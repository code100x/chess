import React, { useState, useEffect } from 'react';
import { Square } from 'chess.js';

interface Move {
  from: Square;
  to: Square;
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
    <div className="bg-gray-100 rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-2 text-gray-800">Moves Table</h2>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 text-gray-800 font-semibold">From</th>
              <th className="px-4 py-2 text-gray-800 font-semibold">To</th>
            </tr>
          </thead>
          <tbody>
            {movesData.map((move, index) => (
              <tr key={index} className="border-b border-gray-300">
                <td className="px-4 py-2 text-gray-700">{move.from}</td>
                <td className="px-4 py-2 text-gray-700">{move.to}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MovesTable;
