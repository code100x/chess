import bb from '../../../public/bb.png';
import bk from '../../../public/bk.png';
import bn from '../../../public/bn.png';
import bp from '../../../public/bp.png';
import bq from '../../../public/bq.png';
import br from '../../../public/br.png';
import wb from '../../../public/wb.png';
import wk from '../../../public/wk.png';
import wn from '../../../public/wn.png';
import wp from '../../../public/wp.png';
import wq from '../../../public/wq.png';
import wr from '../../../public/wr.png';

import { Square } from 'chess.js';
import React, { useEffect, useState } from 'react';
import * as engine from '../../helper/BotEngine';


interface Move {
  from: Square;
  to: Square;
  piece: string;
}

interface MovesTableProps {
  history: Array<engine.Move>;
}

const BlackPiece = {
  p: bp,
  n: bn,
  b: bb,
  r: br,
  q: bq,
  k: bk,
};
const WhitePieces = {
  p: wp,
  n: wn,
  b: wb,
  r: wr,
  q: wq,
  k: wk,
};

const BotMoveTable: React.FC<MovesTableProps> = ({ history }) => {
  const [movesData, setMovesData] = useState<Move[]>([]);

  useEffect(() => {
    const moves = history.map(({ from, to, piece }: engine.Move) => {
      return { from, to, piece: piece };
    });
    setMovesData(moves);
  }, [history]);

  return (
    <div className="bg-black">
      <div className="bg-brown-600 rounded shadow">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>
              {Array.from(
                { length: Math.ceil(movesData.length / 2) },
                (_, i) => i,
              ).map((_, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? 'bg-[#292524]' : 'bg-[#484645]'}
                >
                  <td className="px-4 py-4 text-white  border-gray-700  w-12 ">
                    {i + 1 + '.'}
                  </td>
                  <td className="px-4 py-4 text-white border-gray-700  ">
                    {movesData[i * 2] && (
                      <>
                        <div className="flex">
                          <img
                            className="h-4 w-4 mt-1"
                            src={
                              WhitePieces[
                                movesData[i * 2]
                                  .piece as keyof typeof WhitePieces
                              ]
                            }
                          />
                          {movesData[i * 2].from + 'x' + movesData[i * 2].to}
                        </div>
                      </>
                    )}
                  </td>
                  <td className=" py-4 px-6 text-white border-gray-700  ">
                    {movesData[i * 2 + 1] && (
                      <>
                        <div className="flex">
                          <img
                            className="h-4 w-4 mt-1"
                            src={
                              BlackPiece[
                                movesData[i * 2 + 1]
                                  .piece as keyof typeof BlackPiece
                              ]
                            }
                          />
                          {movesData[i * 2 + 1].from +
                            'x' +
                            movesData[i * 2 + 1].to}
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

export default BotMoveTable;
