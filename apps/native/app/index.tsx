import { memo, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Text,
  Image,
  Dimensions,
} from "react-native";
import { Move } from "chess.js";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Chessboard, { ChessboardRef } from "../components/chessboard";
import { PIECES } from "../components/chessboard/constants";

const PADDING = 16;
const CHESSBOARD_BORDER_WIDTH = 3;

const tournament_id = "tournament_1";
const match_id = "match_1";
const firestore_id = `${tournament_id}___${match_id}`;
const SCREEN_WIDTH = Dimensions.get("window").width;
const CHESSBOARD_SIZE =
  Math.floor((SCREEN_WIDTH - PADDING - CHESSBOARD_BORDER_WIDTH) / 8) * 8;

const ChessBoard = () => {
  const chessboardRef = useRef<ChessboardRef>(null);

  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View style={styles.chessboardContainer}>
            <Chessboard
              ref={chessboardRef}
              onMove={console.log}
              boardSize={CHESSBOARD_SIZE}
              // fen={gameState?.board?.fen}
              boardOrientation={"black"}
            />
          </View>
        </View>
      </GestureHandlerRootView>
    </>
  );

  // return (
  //   <View
  //     style={{
  //       flex: 1,
  //       backgroundColor: "white",
  //     }}
  //   >

  //     <View
  //       style={{
  //         flex: 1,
  //         alignItems: "center",
  //         justifyContent: "center",
  //         padding: PADDING,
  //       }}
  //     >
  //       <CapturedPieces color="black" moves={gameState.moves} />
  //       <View
  //         style={{
  //           width: "100%",
  //           display: "flex",
  //           justifyContent: "space-between",
  //           flexDirection: "row",
  //           paddingVertical: 8,
  //         }}
  //       >
  //         <Typography
  //           fontWeight="bold"
  //           fontSize={28}
  //           color={theme.colors.black}
  //         >
  //           09:59:59
  //         </Typography>

  //         {gameState.currentTurn !== playercolor ? (
  //           <View
  //             style={{
  //               justifyContent: "center",
  //               alignItems: "center",
  //               paddingHorizontal: 20,
  //               paddingVertical: 4,
  //               borderWidth: 1,
  //               borderColor: theme.colors.success,
  //             }}
  //           >
  //             <Text
  //               style={{
  //                 fontWeight: "bold",
  //                 fontSize: 16,
  //                 color: theme.colors.success,
  //               }}
  //             >
  //               In Play
  //             </Text>
  //           </View>
  //         ) : null}
  //         {
  //           gameState.currentTurn === playercolor && gameState?.lastMove?.san ?    <View
  //           style={{
  //             justifyContent: "center",
  //             alignItems: "center",
  //             paddingHorizontal: 20,
  //             paddingVertical: 4,
  //             backgroundColor: theme.colors.gainsboro
  //           }}
  //         >
  //           <Text
  //             style={{
  //               fontWeight: "bold",
  //               fontSize: 16,
  //               color: theme.colors.black,
  //             }}
  //           >
  //            {gameState.lastMove.san.toUpperCase()}
  //           </Text>
  //         </View> : null
  //         }
  //       </View>
  //       <View style={styles.chessboardContainer}>
  //         <Chessboard
  //           colors={{
  //             black: theme.colors.secondaryBlue,
  //             white: "#ebedf3",
  //             checkmateHighlight: theme.colors.error,
  //           }}
  //           ref={chessboardRef}
  //           onMove={onPlayerMoves}
  //           boardSize={CHESSBOARD_SIZE}
  //           fen={gameState?.board?.fen}
  //           boardOrientation={playercolor === "black" ? "black" : "white"}
  //         />
  //       </View>
  //       <View
  //         style={{
  //           width: "100%",
  //           display: "flex",
  //           justifyContent: "space-between",
  //           flexDirection: "row",
  //           paddingVertical: 8,
  //         }}
  //       >
  //         <Typography
  //           fontWeight="bold"
  //           fontSize={28}
  //           color={theme.colors.black}
  //         >
  //           09:59:59
  //         </Typography>
  //         {gameState.currentTurn === playercolor ? (
  //           <View
  //             style={{
  //               justifyContent: "center",
  //               alignItems: "center",
  //               paddingHorizontal: 20,
  //               paddingVertical: 4,
  //               borderWidth: 1,
  //               borderColor: theme.colors.success,
  //             }}
  //           >
  //             <Text
  //               style={{
  //                 fontWeight: "bold",
  //                 fontSize: 16,
  //                 color: theme.colors.success,
  //               }}
  //             >
  //               In Play
  //             </Text>
  //           </View>
  //         ) : null}
  //         {
  //           gameState.currentTurn !== playercolor && gameState?.lastMove?.san ?    <View
  //           style={{
  //             justifyContent: "center",
  //             alignItems: "center",
  //             paddingHorizontal: 20,
  //             paddingVertical: 4,
  //             backgroundColor: theme.colors.gainsboro
  //           }}
  //         >
  //           <Text
  //             style={{
  //               fontWeight: "bold",
  //               fontSize: 16,
  //               color: theme.colors.black,
  //             }}
  //           >
  //            {gameState.lastMove.san.toUpperCase()}
  //           </Text>
  //         </View> : null
  //         }
  //       </View>
  //       <CapturedPieces moves={gameState.moves} color={"white"} />
  //     </View>
  //     <CustomButton
  //       label="Abort"
  //       onPress={console.log}
  //       buttonColor="#ab0400"
  //       containerStyle={{
  //         width: "100%",
  //       }}
  //       style={{
  //         width: "100%",
  //         borderRadius: 0,
  //       }}
  //       labelStyle={{
  //         color: "white",
  //         fontWeight: "600",
  //         fontFamily: "Poppins-Bold",
  //       }}
  //     />
  //   </View>
  // );
};

export default ChessBoard;

function get_captured_pieces(moves: Move[], color: string) {
  const captured = { p: 0, n: 0, b: 0, r: 0, q: 0 };

  for (const move of moves) {
    if (move.hasOwnProperty("captured") && move.color !== color[0]) {
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
  color: "black" | "white";
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
              <Text style={{ color: "#fff", fontSize: 12 }}>{item[1]}</Text>
            </View>
          </View>
        ) : (
          <></>
        )
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  chessboardContainer: {
    borderWidth: CHESSBOARD_BORDER_WIDTH,
    borderColor: "#000",
  },
  capturedPieceContainer: { flexDirection: "row", gap: 1, width: "100%" },
  blueDot: {
    position: "absolute",
    borderRadius: 8,
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#0000ff",
  },
});
