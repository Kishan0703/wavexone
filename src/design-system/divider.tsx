import { StyleSheet, View } from 'react-native'

import { colors } from './colors'

/** Hairline between rows inside a card. */
export function Divider({ inset = 0, color = colors.divider }: { inset?: number; color?: string }) {
  return <View style={[styles.base, { marginLeft: inset, backgroundColor: color }]} />
}

/** Vertical hairline, used to split the Activity summary into two columns. */
export function VerticalDivider({ color = colors.onInkDivider }: { color?: string }) {
  return <View style={[styles.vertical, { backgroundColor: color }]} />
}

const styles = StyleSheet.create({
  base: {
    height: StyleSheet.hairlineWidth * 2,
  },
  vertical: {
    width: StyleSheet.hairlineWidth * 2,
    alignSelf: 'stretch',
  },
})
