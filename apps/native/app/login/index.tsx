import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { PRIMARY_BROWN } from '../../constants/colors';
import { PIECES } from '../../components/chessboard/constants';
import { Stack, router } from 'expo-router';

const LoginScreen = () => {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerTitle: '' }} />
      <Text style={styles.title}>Create your</Text>
      <Text style={styles.title}>100XChess account</Text>
      <Image source={PIECES['bk']} style={styles.image} />
      <Pressable
        style={{ width: '100%' }}
        onPress={() => {
          router.replace('game');
        }}
      >
        <View style={styles.button1}>
          <Text style={styles.loginText}>Continue as guest</Text>
        </View>
      </Pressable>
      <Text style={{ color: '#fff' }}>OR </Text>
      <Pressable style={{ width: '100%' }} onPress={console.log}>
        <View style={styles.button2}>
          <Text style={styles.loginText2}>Continue with Google</Text>
        </View>
      </Pressable>
      <Pressable style={{ width: '100%' }} onPress={console.log}>
        <View style={styles.button2}>
          <Text style={styles.loginText2}>Continue with Github</Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: PRIMARY_BROWN,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  image: {
    width: 60,
    aspectRatio: 1,
  },
  button1: {
    backgroundColor: '#779654',
    padding: 12,
    margin: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  button2: {
    backgroundColor: '#302c2a',
    padding: 12,
    margin: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  loginText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  loginText2: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LoginScreen;
