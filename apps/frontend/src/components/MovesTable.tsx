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
    <div className="bg-black">
      <div className="bg-gray-900 border border-gray-800 rounded shadow p-4">
        <h2 className="text-lg font-bold mb-4 text-white">Moves Table</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-2 bg-gray-800 text-white border border-gray-700">
                  From
                </th>
                <th className="px-4 py-2 bg-gray-800 text-white border border-gray-700">
                  To
                </th>
              </tr>
            </thead>
            <tbody>
              {movesData.map((move, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-800" : "bg-gray-700"}
                >
                  <td className="px-4 py-2 text-white border border-gray-700">
                    {move.from}
                  </td>
                  <td className="px-4 py-2 text-white border border-gray-700">
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

export default MovesTable;
