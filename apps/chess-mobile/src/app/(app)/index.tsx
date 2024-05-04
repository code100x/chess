import { Text, View } from "react-native";
import { Button, ChessBoardUI, Container } from "~/components";

export default function Home() {  
  return (
    <Container className="bg-slate-950">
      <View className="flex-1 py-10 justify-evenly">
        <View className='items-center justify-center gap-y-3'>
          <Text className='text-slate-300 text-4xl font-bold'>Immerse Yourself in</Text>
          <Text className='text-slate-300 text-5xl font-bold'>CHESS</Text>
        </View>
        <ChessBoardUI/>
        <Button 
          className='flex-row gap-x-4 rounded-xl' 
          roundClass='rounded-xl'
          size='lg'
          onPress={()=>console.log("Button pressed: GOOGLE")}
        >
          <Text className='text-white font-bold text-2xl'>Play Online</Text>
        </Button>
      </View>
    </Container>
  );
}
