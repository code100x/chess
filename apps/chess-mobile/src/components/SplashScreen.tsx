import LottieView from 'lottie-react-native';
import { View } from 'react-native';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';

const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

const SplashScreen = ({onAnimationFinish}:{onAnimationFinish?:(isCancelled:boolean)=>void}) => {
  return (
    <View className='flex-1 items-center justify-center bg-slate-950'>
      <AnimatedLottieView
        exiting={ZoomOut}
        onAnimationFinish={onAnimationFinish}
        autoPlay
        loop={false}
        style={{
          width: '80%',
          maxWidth: 400,
          flex: 1,
        }}
        
        source={require('~assets/lottie/chess.json')}
        />
    </View>
  )
}

export default SplashScreen