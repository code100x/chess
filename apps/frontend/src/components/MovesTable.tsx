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
    <div className="bg-slate rounded shadow p-4">
      <h2 className="text-lg font-bold mb-4 text-white">Moves Table</h2>
      <table className="w-full">
        <thead>
          <tr>
            <th className="px-4 py-2 text-white">From</th>
            <th className="px-4 py-2 text-white">To</th>
          </tr>
        </thead>
        <tbody>
          {movesData.map((move, index) => (
            <tr key={index} className="border-b">
              <td className="px-4 py-2 text-white">{move.from}</td>
              <td className="px-4 py-2 text-white">{move.to}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MovesTable;
