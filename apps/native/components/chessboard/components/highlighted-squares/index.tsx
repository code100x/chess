import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useChessboardProps } from '../../context/props-context/hooks';

import { useChessEngine } from '../../context/chess-engine-context/hooks';
import { useReversePiecePosition } from '../../notation';
import { HighlightedSquare } from './highlighted-square';
import { useSquareRefs } from '../../context/board-refs-context/hooks';

const HighlightedSquares: React.FC = React.memo(() => {
  const chess = useChessEngine();
  const board = useMemo(() => chess.board(), [chess]);
  const { pieceSize } = useChessboardProps();
  const { toPosition, toTranslation } = useReversePiecePosition();
  const refs = useSquareRefs();

  return (
    <View
      style={{
        ...StyleSheet.absoluteFillObject,
      }}
    >
      {board.map((row, y) =>
        row.map((_, x) => {
          const square = toPosition({ x: x * pieceSize, y: y * pieceSize });
          const translation = toTranslation(square);

          return (
            <HighlightedSquare
              key={`${x}-${y}`}
              ref={refs?.current?.[square]}
              style={[
                styles.highlightedSquare,
                {
                  width: pieceSize,
                  transform: [
                    { translateX: translation.x },
                    { translateY: translation.y },
                  ],
                },
              ]}
            />
          );
        }),
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  highlightedSquare: {
    position: 'absolute',
    aspectRatio: 1,
  },
});

export { HighlightedSquares };
