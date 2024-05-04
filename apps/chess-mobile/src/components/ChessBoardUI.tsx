import { Text, View } from "react-native";
import { cn } from "~/lib/utils";

const fillArray = Array(8).fill("_");

export const ChessBoardUI = () => {
  return (
    <View className="rounded-lg overflow-hidden">
      {fillArray.map((_, i) => (
        <View key={i} className="flex-row">
          {fillArray.map((_,j)=> {
            const white = i % 2 === j % 2;
            return (
              <View 
                key={`${i}${j}`}
                className={cn("flex-1 aspect-square", white ? 'bg-[#739552]' : 'bg-[#EBEDD0]')}
              >
                <Text>{i % 2}{j % 2}</Text>
              </View>
            )
          })}
        </View>
      ))}
    </View>
  )
};