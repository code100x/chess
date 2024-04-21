import { memo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Move } from 'chess.js';
import Chessboard, { ChessboardRef } from '../../components/chessboard';
import { PIECES } from '../../components/chessboard/constants';
import { ChessMoveInfo } from '../../components/chessboard/context/props-context';
import React from 'react';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHESSBOARD_SIZE = SCREEN_WIDTH;
// Math.floor((SCREEN_WIDTH - PADDING - CHESSBOARD_BORDER_WIDTH) / 8) * 8;

const ChessBoard = () => {
  const chessboardRef = useRef<ChessboardRef>(null);
  const [moves, setMoves] = useState<ChessMoveInfo[]>([]);
  const [pgn, setPgn] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#252422',
      }}
    >
      <View
        style={{
          width: '100%',
          paddingHorizontal: 16,
          paddingBottom: 2,
        }}
      >
        <ScrollView
          horizontal
          ref={scrollViewRef}
          onContentSizeChange={() =>
            scrollViewRef.current.scrollToEnd({ animated: true })
          }
        >
          <View
            style={{
              width: '100%',
              flexDirection: 'row',

              gap: 4,
            }}
          >
            {moves.map((move, index) => {
              return (
                <React.Fragment key={index}>
                  {index % 2 === 0 ? (
                    <Text style={{ color: '#787674' }}>{index / 2 + 1}. </Text>
                  ) : null}
                  <Text style={{ color: '#c8c6c4' }}>{move.move.san} </Text>
                </React.Fragment>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <PlayerStrip />
      <View>
        <Chessboard
          ref={chessboardRef}
          onMove={(move) => {
            setMoves([...moves, move]);
            setPgn(move.state.pgn);
          }}
          durations={{ move: 0 }}
          boardSize={CHESSBOARD_SIZE}
          // fen={gameState?.board?.fen}
          boardOrientation={'black'}
          colors={{
            black: '#779654',
            white: '#efeed3',
            checkmateHighlight: '#ff0000',
            lastMoveHighlight: '#f7f683',
          }}
        />
      </View>
      <PlayerStrip />
    </View>
  );
};

export default ChessBoard;

const PlayerStrip = () => {
  return (
    <View style={styles.playerStrip}>
      <View style={styles.playerAvatar}></View>
      <View>
        <Text style={styles.name}>Player 1</Text>
      </View>
    </View>
  );
};

function get_captured_pieces(moves: Move[], color: string) {
  const captured = { p: 0, n: 0, b: 0, r: 0, q: 0 };

  for (const move of moves) {
    if (move.hasOwnProperty('captured') && move.color !== color[0]) {
      captured[move.captured]++;
    }
  }

  return captured;
}

const CapturedPieces = memo(function CapturedPieces({
  moves,
  color,
}: {
  moves: Move[];
  color: 'black' | 'white';
}) {
  const captured = get_captured_pieces(moves, color);

  return (
    <View style={styles.capturedPieceContainer}>
      {Object.entries(captured).map((item) =>
        item[1] ? (
          <View key={PIECES[color[0] + item[0]]}>
            <Image
              style={{ width: 40, height: 40 }}
              source={PIECES[color[0] + item[0]]}
            />
            <View style={styles.blueDot}>
              <Text style={{ color: '#fff', fontSize: 12 }}>{item[1]}</Text>
            </View>
          </View>
        ) : (
          <></>
        ),
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  chessboardContainer: {},
  playerStrip: {
    backgroundColor: '#302c2a',
    padding: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 8,
  },
  name: { color: '#fff', fontSize: 12, lineHeight: 12 },
  playerAvatar: {
    width: 32,
    height: 32,
    backgroundColor: '#e6e4e2',
    borderRadius: 4,
  },
  capturedPieceContainer: { flexDirection: 'row', gap: 1, width: '100%' },
  blueDot: {
    position: 'absolute',
    borderRadius: 8,
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#0000ff',
  },
});
