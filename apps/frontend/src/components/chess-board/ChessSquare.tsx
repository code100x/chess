import { Color, PieceSymbol, Square } from 'chess.js';

const ChessSquare = ({
  square,
}: {
  square: {
    square: Square;
    type: PieceSymbol;
    color: Color;
  };
}) => {
  return (
    <div className="h-full justify-center flex flex-col ">
      {square ? (
        <img
          className="w-[4.25rem]"
          src={`/${square?.color === 'b' ? `b${square.type}` : `w${square.type}`}.png`}
        />
      ) : null}
    </div>
  );
};

export default ChessSquare;