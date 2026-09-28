import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import {
  ArrowLeftIcon,
  AssetIcon,
  Button,
  ButtonSubText,
  ButtonText,
  CircleButton,
  Delta,
  Gutter,
  Pressable,
  Screen,
  StarIcon,
  Text,
  colors,
  fonts,
  radius,
} from '../design-system'
import { PriceChart } from '../features/chart/price-chart'
import {
  instruments,
  instrumentsById,
  timeframes,
  xauCursorClose,
  xauCursorIndex,
  xauCursorOpen,
  xauMonths,
  xauSeries,
} from '../data/mock'
import { directionOf, formatPercent, formatPrice } from '../data/format'
import type { RootStackParamList } from '../navigation/types'

type InstrumentRoute = RouteProp<RootStackParamList, 'Instrument'>

/** Instrument detail: quote, timeframe switch, chart and the Sell / Buy pair. */
export function InstrumentScreen() {
  const { goBack } = useNavigation()
  const { params } = useRoute<InstrumentRoute>()
  const [timeframe, setTimeframe] = useState<(typeof timeframes)[number]>('1M')
  const [favorite, setFavorite] = useState(false)

  const instrument = instrumentsById.get(params.instrumentId) ?? instruments[0]
  const direction = directionOf(instrument.changePercent)

  return (
    <Screen>
      <Gutter style={styles.header}>
        <CircleButton onPress={goBack} accessibilityLabel="Go back">
          <ArrowLeftIcon size={22} color={colors.text} />
        </CircleButton>

        <View style={styles.headerTitle}>
          <Text variant="heading" style={styles.symbol}>
            {instrument.symbol}
          </Text>
          <Text variant="body" color={colors.textMuted}>
            {instrument.description}
          </Text>
        </View>

        <CircleButton
          onPress={() => setFavorite((previous) => !previous)}
          accessibilityLabel={favorite ? 'Remove from favourites' : 'Add to favourites'}
        >
          <StarIcon size={22} color={favorite ? colors.gold : colors.text} filled={favorite} />
        </CircleButton>
      </Gutter>

      <View style={styles.content}>
        <Gutter>
          <View style={styles.quote}>
            <View style={styles.quoteMark} pointerEvents="none">
              <AssetIcon kind={instrument.icon} tint={QUOTE_MARK_TINT} size={96} label={instrument.iconLabel} />
            </View>

            <View style={styles.quoteIdentity}>
              <Text variant="displaySm" color={colors.onInk}>
                {formatPrice(instrument.price, instrument.precision)}
              </Text>
              <Text variant="body" color={colors.onInkMuted}>
                {instrument.description}
              </Text>
            </View>

            <Delta label={formatPercent(instrument.changePercent)} direction={direction} onInk />
          </View>
        </Gutter>

        <Gutter style={styles.timeframes}>
          {timeframes.map((option) => {
            const selected = option === timeframe
            return (
              <Pressable
                key={option}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => setTimeframe(option)}
                style={[styles.timeframe, selected ? styles.timeframeSelected : null]}
              >
                <Text
                  style={[styles.timeframeLabel, selected ? styles.timeframeLabelSelected : null]}
                >
                  {option}
                </Text>
              </Pressable>
            )
          })}
        </Gutter>

        <Gutter style={styles.chart}>
          <PriceChart
            series={xauSeries}
            months={xauMonths}
            cursorIndex={xauCursorIndex}
            cursorOpen={xauCursorOpen}
            cursorClose={xauCursorClose}
            min={2000}
            max={2600}
            step={100}
          />
        </Gutter>
      </View>

      <Gutter style={styles.actions}>
        <Button tone="ink" style={styles.action}>
          <ButtonText tone="ink">Sell</ButtonText>
          <ButtonSubText tone="ink">{formatPrice(instrument.bid, instrument.precision)}</ButtonSubText>
        </Button>
        <Button tone="gold" style={styles.action}>
          <ButtonText tone="gold">Buy</ButtonText>
          <ButtonSubText tone="gold">{formatPrice(instrument.ask, instrument.precision)}</ButtonSubText>
        </Button>
      </Gutter>
    </Screen>
  )
}

/** The instrument mark printed faintly inside the dark quote card. */
const QUOTE_MARK_TINT = 'rgba(255, 255, 255, 0.08)'

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 18,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  symbol: {
    fontSize: 21,
  },
  content: {
    flex: 1,
    paddingBottom: 18,
    gap: 16,
  },
  chart: {
    flex: 1,
  },

  quote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 24,
    borderCurve: 'continuous',
    paddingHorizontal: 20,
    paddingVertical: 22,
    overflow: 'hidden',
  },
  quoteMark: {
    position: 'absolute',
    left: '46%',
    bottom: -14,
  },
  quoteIdentity: {
    flex: 1,
    gap: 4,
  },

  timeframes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeframe: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderCurve: 'continuous',
  },
  timeframeSelected: {
    backgroundColor: colors.ink,
  },
  timeframeLabel: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
  },
  timeframeLabelSelected: {
    fontFamily: fonts.bold,
    color: colors.onInk,
  },

  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 12,
  },
  action: {
    flex: 1,
  },
})
