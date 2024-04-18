import React, { useState, useEffect } from 'react';

interface Move {
  from: string;
  to: string;
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
    <div className="bg-blue-200 rounded shadow p-4">
      <h2 className="text-lg font-bold mb-4">Moves Table</h2>
      <table className="w-full">
        <thead>
          <tr>
            <th className="px-4 py-2">From</th>
            <th className="px-4 py-2">To</th>
          </tr>
        </thead>
        <tbody>
          {movesData.map((move, index) => (
            <tr key={index} className="border-b">
              <td className="px-4 py-2">{move.from}</td>
              <td className="px-4 py-2">{move.to}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MovesTable;
