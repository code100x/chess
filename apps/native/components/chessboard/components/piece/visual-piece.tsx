import React from 'react';
import { Image, ImageProps } from 'react-native';
import { PIECES } from '../../constants';
import { useChessboardProps } from '../../context/props-context/hooks';
import type { PieceType } from '../../types';

type ChessPieceType = {
  id: PieceType;
} & Partial<ImageProps>;

const ChessPiece: React.FC<ChessPieceType> = React.memo(({ id, ...rest }) => {
  const { pieceSize, renderPiece, boardOrientation } = useChessboardProps();

  return (
    renderPiece?.(id) ?? (
      <Image
        style={[
          {
            width: pieceSize,
            height: pieceSize,
            transform: [
              { rotate: boardOrientation === 'white' ? '0deg' : '180deg' },
            ],
          },
          rest.style,
        ]}
        {...rest}
        source={PIECES[id]}
      />
    )
  );
});

export { ChessPiece };
