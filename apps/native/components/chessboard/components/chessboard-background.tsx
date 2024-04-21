/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useChessboardProps } from '../context/props-context/hooks';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
});

type BackgroundProps = {
  letters: boolean;
  numbers: boolean;
};

interface BaseProps extends BackgroundProps {
  white: boolean;
}

interface RowProps extends BaseProps {
  row: number;
}

interface SquareProps extends RowProps {
  col: number;
}

const Square = React.memo(
  ({ white, row, col, letters, numbers }: SquareProps) => {
    const { colors, boardOrientation } = useChessboardProps();
    const backgroundColor = white ? colors.black : colors.white;
    const color = white ? colors.white : colors.black;
    const textStyle = { fontWeight: '500' as const, fontSize: 10, color };
    const newLocal = col === 0;
    const rowNumber = boardOrientation === 'white' ? 8 - row : row + 1;
    const colNumber = boardOrientation === 'white' ? col : 7 - col;
    return (
      <View
        style={{
          flex: 1,
          backgroundColor,
          padding: 4,
          justifyContent: 'space-between',
        }}
      >
        {numbers && (
          <Text style={[textStyle, { opacity: newLocal ? 1 : 0 }]}>
            {'' + rowNumber}
          </Text>
        )}
        {row === 7 && letters && (
          <Text style={[textStyle, { alignSelf: 'flex-end' }]}>
            {String.fromCharCode(97 + colNumber)}
          </Text>
        )}
      </View>
    );
  },
);

const Row = React.memo(({ white, row, ...rest }: RowProps) => {
  const offset = white ? 0 : 1;
  return (
    <View style={styles.container}>
      {new Array(8).fill(0).map((_, i) => (
        <Square
          {...rest}
          row={row}
          col={i}
          key={i}
          white={(i + offset) % 2 === 1}
        />
      ))}
    </View>
  );
});

const Background: React.FC = React.memo(() => {
  const { withLetters, withNumbers, boardOrientation } = useChessboardProps();
  return (
    <View
      style={{
        flex: 1,
        transform: [
          { rotate: boardOrientation === 'white' ? '0deg' : '180deg' },
        ],
      }}
    >
      {new Array(8).fill(0).map((_, i) => (
        <Row
          key={i}
          white={i % 2 === 0}
          row={i}
          letters={withLetters}
          numbers={withNumbers}
        />
      ))}
    </View>
  );
});

export default Background;
