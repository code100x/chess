import { useChessboardProps } from '../../../context/props-context/hooks';
import React from 'react';
import type { PieceType } from 'chess.js';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { StyleSheet } from 'react-native';
import type { BoardPromotionContextState } from '..';
import { DialogPiece } from './dialog-piece';

const PROMOTION_PIECES: PieceType[] = ['q', 'r', 'n', 'b'];

const PromotionDialog: React.FC<Required<BoardPromotionContextState>> =
  React.memo(({ type, onSelect }) => {
    const { boardSize } = useChessboardProps();

    return (
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={[
          {
            width: boardSize / 3,
          },
          styles.container,
        ]}
      >
        {PROMOTION_PIECES.map((piece, i) => {
          return (
            <DialogPiece
              key={i}
              width={boardSize / 6}
              index={i}
              piece={piece}
              type={type}
              onSelectPiece={onSelect}
            />
          );
        })}
      </Animated.View>
    );
  });

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    aspectRatio: 1,
    backgroundColor: 'rgba(256,256,256,0.85)',
    borderRadius: 5,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowOffset: {
      height: 5,
      width: 0,
    },
    flexWrap: 'wrap',
  },
});

export { PromotionDialog };
