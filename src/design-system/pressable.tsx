import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type AnimatedStyle,
} from 'react-native-reanimated'
import type { StyleProp, ViewStyle } from 'react-native'

export { Pressable } from 'react-native'

export type PressableScaleProps = {
  onPress?: () => void
  children: React.ReactNode
  style?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>
  /** How far the target shrinks while held. */
  scaleTo?: number
  disabled?: boolean
  hitSlop?: number
}

const TIMING = { duration: 120 }

/**
 * Press target with a spring-free scale response.
 *
 * The gesture callbacks are worklets, so the press state never round-trips
 * through the JS thread. The shared value stores the *state* (0 = idle,
 * 1 = held) and the transform is derived from it.
 */
export function PressableScale({
  onPress,
  children,
  style,
  scaleTo = 0.96,
  disabled = false,
  hitSlop = 0,
}: PressableScaleProps) {
  const pressed = useSharedValue(0)

  const tap = Gesture.Tap()
    .enabled(!disabled)
    .hitSlop({ top: hitSlop, bottom: hitSlop, left: hitSlop, right: hitSlop })
    .onBegin(() => {
      pressed.set(withTiming(1, TIMING))
    })
    .onFinalize(() => {
      pressed.set(withTiming(0, TIMING))
    })
    .onEnd(() => {
      if (onPress) runOnJS(onPress)()
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.get(), [0, 1], [1, scaleTo]) }],
    opacity: interpolate(pressed.get(), [0, 1], [1, 0.92]),
  }))

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </GestureDetector>
  )
}
