import { StyleSheet, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'

import { colors } from './colors'
import { Text } from './text'
import { fonts } from './tokens'

type Tone = 'light' | 'dark'

/**
 * The "W" mark: a heavy double chevron with the final upstroke struck
 * through in gold.
 */
export function LogoMark({ size = 28, tone = 'light' }: { size?: number; tone?: Tone }) {
  const ink = tone === 'dark' ? colors.logoOnInk : colors.logoInk
  return (
    <Svg width={size * 1.5} height={size} viewBox="0 0 108 72">
      <Path d="M0 0h28l19 44L66 0h22L56 72H34Z" fill={ink} />
      <Path d="M70 0h34L82 48Z" fill={colors.gold} />
    </Svg>
  )
}

/**
 * Full lockup. "Wavex" is heavy, the "O" is a light gold ring and "ne"
 * returns to the wordmark grey.
 */
export function Logo({ size = 22, tone = 'light' }: { size?: number; tone?: Tone }) {
  const ink = tone === 'dark' ? colors.logoOnInk : colors.logoInk
  return (
    <View style={styles.row}>
      <LogoMark size={size * 0.95} tone={tone} />
      <Text style={[styles.word, { fontSize: size * 1.05, color: ink }]}>
        <Text style={[styles.heavy, { fontSize: size * 1.05, color: ink }]}>Wavex</Text>
        <Text style={[styles.word, { fontSize: size * 1.05, color: colors.gold }]}>O</Text>
        <Text style={[styles.word, { fontSize: size * 1.05, color: ink }]}>ne</Text>
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  word: {
    fontFamily: fonts.regular,
    letterSpacing: -0.2,
  },
  heavy: {
    fontFamily: fonts.extrabold,
    letterSpacing: -0.4,
  },
})
