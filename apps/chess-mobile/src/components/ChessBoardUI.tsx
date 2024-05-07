import { Image, Text, View } from "react-native";
import { cn } from "~/lib/utils";

const RANKS = [1, 2, 3, 4, 5, 6, 7, 8];
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const PIECE_POSITION: Record<string, string> = {
  "a1": "wr.png",
  "b1": "wn.png",
  "c1": "wb.png",
  "d1": "wq.png",
  "e1": "wk.png",
  "f1": "wb.png",
  "g1": "wn.png",
  "h1": "wr.png",
  "a2": "wp.png",
  "b2": "wp.png",
  "c2": "wp.png",
  "d2": "wp.png",
  "e2": "wp.png",
  "f2": "wp.png",
  "g2": "wp.png",
  "h2": "wp.png",
  "a8": "br.png",
  "b8": "bn.png",
  "c8": "bb.png",
  "d8": "bq.png",
  "e8": "bk.png",
  "f8": "bb.png",
  "g8": "bn.png",
  "h8": "br.png",
  "a7": "bp.png",
  "b7": "bp.png",
  "c7": "bp.png",
  "d7": "bp.png",
  "e7": "bp.png",
  "f7": "bp.png",
  "g7": "bp.png",
  "h7": "bp.png"
};
const imageUrl: Record<string, any> = {
  "wr.png": require("~assets/pieces/wr.png"),
  "wn.png": require("~assets/pieces/wn.png"),
  "wb.png": require("~assets/pieces/wb.png"),
  "wq.png": require("~assets/pieces/wq.png"),
  "wk.png": require("~assets/pieces/wk.png"),
  "wp.png": require("~assets/pieces/wp.png"),
  "br.png": require("~assets/pieces/br.png"),
  "bn.png": require("~assets/pieces/bn.png"),
  "bb.png": require("~assets/pieces/bb.png"),
  "bq.png": require("~assets/pieces/bq.png"),
  "bp.png": require("~assets/pieces/bp.png"),
  "bk.png": require("~assets/pieces/bk.png"),
}

export const ChessBoardUI = () => {
  return (
    <View className="rounded overflow-hidden">
      {RANKS.reverse().map((rank, i) => (
        <View key={i} className="flex-row">
          {FILES.map((file, j) => {
            const white = i % 2 === j % 2;
            const position = file + rank;
            const pieceImage = PIECE_POSITION[position];
            return (
              <View
                key={`${i}${j}`}
                className={cn('relative aspect-square flex-1 p-1', white ? 'bg-[#EBEDD0]' : 'bg-[#739552]')}>
                {pieceImage && (
                  <Image
                    source={imageUrl[pieceImage]}
                    className="max-w-full h-full aspect-square"
                  />
                )}
                {j === 0 && (
                  <Text
                    className={cn('absolute font-bold p-0.5', !white ? 'text-[#EBEDD0]' : 'text-[#739552]')}
                  >
                    {rank}
                  </Text>
                )}
                {i === RANKS.length - 1 && (
                  <Text
                    className={cn('absolute bottom-0 right-0 font-bold p-0.5', !white ? 'text-[#EBEDD0]' : 'text-[#739552]')}
                  >
                    {file}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  )
};