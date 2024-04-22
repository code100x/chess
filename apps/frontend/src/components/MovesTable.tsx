import bb from "../../public/bb.png"
import bk from "../../public/bk.png"
import bn from "../../public/bn.png"
import bq from "../../public/bq.png"
import br from "../../public/br.png"
import bp from "../../public/bp.png"
import wb from "../../public/wb.png"
import wk from "../../public/wk.png"
import wn from "../../public/wn.png"
import wp from "../../public/wp.png"
import wq from "../../public/wq.png"
import wr from "../../public/wr.png"

import React, { useState, useEffect } from 'react';
import { Square } from 'chess.js';
interface Move {
  from: Square;
  to: Square;
  piece: String
}

interface MovesTableProps {
  moves: Move[];
}

const BlackPiece = {
  'p': bp,
  'n': bn,
  'b': bb,
  'r': br,
  'q': bq,
  'k': bk
}
const WhitePieces = {
  'p': wp,
  'n': wn,
  'b': wb,
  'r': wr,
  'q': wq,
  'k': wk
}

const MovesTable: React.FC<MovesTableProps> = ({ moves }) => {
  const [movesData, setMovesData] = useState<Move[]>([]);

  useEffect(() => {
    setMovesData(moves);
  }, [moves]);
  return (
    <div className="bg-black">
      <div className="bg-brown-600 rounded shadow">
      <h2 className="text-lg font-bold mb-4 text-white text-center pt-2 ">
          Moves Table
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">

            <tbody>
              {Array.from({ length: Math.ceil(movesData.length / 2) }, (_, i) => i).map((_, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? "bg-brown-600" : "bg-brown-500"}
                >
                  <td className="px-4 py-4 text-white  border-gray-700  w-12 ">
                    {i + 1 + "."}
                  </td>
                  <td className="px-4 py-4 text-white border-gray-700  ">
                    {movesData[i * 2] && (
                      
                      <>
                      {console.log(movesData)}
                        <div className="flex">
                          <img className="h-4 w-4 mt-1" src={WhitePieces[movesData[i * 2].piece as keyof typeof WhitePieces]} />
                          {movesData[i * 2].from + "x" + movesData[i * 2].to}
                        </div>

                      </>
                    )}
                  </td>
                  <td className=" py-4 px-6 text-white border-gray-700  ">
                    {movesData[i * 2 + 1] && (
                      <>
                       {console.log(movesData)}
                        <div className="flex">
                          <img className="h-4 w-4 mt-1" src={BlackPiece[movesData[i * 2+1].piece as keyof typeof BlackPiece]} />
                          {movesData[i * 2 + 1].from + "x" + movesData[i * 2 + 1].to}
                        </div>
                      </>
                    )}

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
