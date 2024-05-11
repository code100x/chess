import { View } from 'react-native';
import { Button, ChessBoardUI, Container, Text } from '~/components';

export default function Home() {
  return (
    <Container className="bg-slate-950">
      <View className="flex-1 justify-evenly py-10">
        <View className="items-center justify-center gap-y-3">
          <Text className="text-3xl font-bold text-slate-300">Immerse Yourself in</Text>
          <Text className="text-4xl font-bold text-slate-300">CHESS</Text>
        </View>
        <ChessBoardUI />
        <Button
          className="flex-row gap-x-4 rounded-xl"
          roundClass="rounded-xl"
          size="lg"
          onPress={() => console.log('Button pressed: GOOGLE')}>
          <Text className="text-xl font-bold text-white">Play Online</Text>
        </Button>
      </View>
    </Container>
  );
}
