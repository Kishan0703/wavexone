import { Text as RNText, StyleSheet, type TextProps as RNTextProps } from 'react-native'

import { colors } from './colors'
import { fonts, type } from './tokens'

type Variant = keyof typeof type
type Weight = keyof typeof fonts

export type TextProps = RNTextProps & {
  variant?: Variant
  /** Overrides the weight baked into the variant. */
  weight?: Weight
  color?: string
}

/**
 * The only text primitive in the app. Screens never reach for react-native's
 * `Text` directly, which keeps the type scale in `tokens.ts` enforceable.
 */
export function Text({ variant = 'body', weight, color, style, ...rest }: TextProps) {
  return (
    <RNText
      {...rest}
      style={[
        styles.base,
        type[variant],
        weight ? { fontFamily: fonts[weight] } : null,
        color ? { color } : null,
        style,
      ]}
    />
  )
}

const styles = StyleSheet.create({
  base: {
    color: colors.text,
  },
})
