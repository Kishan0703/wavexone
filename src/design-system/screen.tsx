import { StyleSheet, View, type ViewProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { colors } from './colors'
import { SCREEN_PADDING } from './tokens'

/**
 * Height reserved under scrolling content so the tab bar never covers it.
 * Covers the bar itself plus the Trade disc, which breaks above the bar.
 */
export const TAB_BAR_CLEARANCE = 108

/**
 * Page container.
 *
 * Screens here draw their own headers rather than using the native stack
 * header, so the top safe-area inset is applied explicitly. Pass
 * `edges={[]}` when a screen bleeds its own artwork under the status bar.
 */
export function Screen({
  children,
  edges = ['top'],
  style,
  ...rest
}: ViewProps & { edges?: readonly ('top' | 'bottom')[] }) {
  const insets = useSafeAreaInsets()

  return (
    <View
      {...rest}
      style={[
        styles.root,
        {
          paddingTop: edges.includes('top') ? insets.top : 0,
          paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}

/** Standard horizontal gutter. */
export function Gutter({ style, ...rest }: ViewProps) {
  return <View {...rest} style={[styles.gutter, style]} />
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  gutter: {
    paddingHorizontal: SCREEN_PADDING,
  },
})
