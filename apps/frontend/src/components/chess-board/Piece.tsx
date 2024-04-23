import { Color, PieceSymbol, Square } from 'chess.js';
import { DragPreviewImage, useDrag } from 'react-dnd';

const Piece = ({
  square,
  isMyTurn,
  handleTriggerPiece,
  started,
  handleCanMakeMove,
}: {
  square: {
    square: Square;
    type: PieceSymbol;
    color: Color;
  };
  handleTriggerPiece: () => void;
  handleCanMakeMove: () => boolean;
  isMyTurn: boolean;
  started: boolean;
}) => {
  const imgSrc = `/${square?.color === 'b' ? `b${square.type}` : `w${square.type}`}.png`;

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: 'chess-piece',
      item: () => {
        handleTriggerPiece();
        return { text: imgSrc };
      },
      canDrag: () => handleCanMakeMove(),
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [isMyTurn, started],
  );

  return (
    <>
      <DragPreviewImage connect={preview} src={imgSrc} />
      <img
        ref={drag}
        className="w-full h-full"
        src={imgSrc}
        style={{
          opacity: isDragging ? 0.5 : 1,
        }}
      />
    </>
  );
};

export default Piece;
