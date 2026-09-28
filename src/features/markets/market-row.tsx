import { StyleSheet, View } from 'react-native'

import {
  AssetIcon,
  Card,
  Delta,
  PressableScale,
  Sparkline,
  Text,
  colors,
  type AssetIconKind,
} from '../../design-system'
import { directionOf, formatPercent, formatPrice } from '../../data/format'

export type MarketRowProps = {
  id: string
  symbol: string
  name: string
  price: number
  precision: 2 | 4
  changePercent: number
  iconKind: AssetIconKind
  iconLabel?: string
  iconTint?: string
  spark: readonly number[]
  sparkTone?: 'positive' | 'negative'
  onPress: (id: string) => void
}

/**
 * One Market Watch row: badge, symbol, trend line, price and change.
 *
 * Receives primitives so the list can skip rows whose values are unchanged,
 * and derives its colours locally rather than taking style objects as props.
 */
export function MarketRow({
  id,
  symbol,
  name,
  price,
  precision,
  changePercent,
  iconKind,
  iconLabel,
  iconTint,
  spark,
  sparkTone,
  onPress,
}: MarketRowProps) {
  const direction = directionOf(changePercent)
  const sparkColor = (sparkTone ?? (direction === 'up' ? 'positive' : 'negative')) === 'positive'
    ? colors.green
    : colors.red

  return (
    <PressableScale onPress={() => onPress(id)} scaleTo={0.985}>
      <Card style={styles.card}>
        <AssetIcon kind={iconKind} label={iconLabel} tint={iconTint} size={40} />

        <View style={styles.identity}>
          <Text variant="strong" numberOfLines={1}>
            {symbol}
          </Text>
          <Text variant="caption" color={colors.textMuted} numberOfLines={1}>
            {name}
          </Text>
        </View>

        <Sparkline points={spark} color={sparkColor} gradientId={`spark-${id}`} width={68} height={40} />

        <View style={styles.quote}>
          <Text variant="strong">{formatPrice(price, precision)}</Text>
          <Delta label={formatPercent(changePercent)} direction={direction} size={15} />
        </View>
      </Card>
    </PressableScale>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  identity: {
    flex: 1,
    gap: 3,
  },
  quote: {
    width: 88,
    alignItems: 'flex-end',
    gap: 5,
  },
})
