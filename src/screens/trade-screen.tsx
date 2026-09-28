import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import {
  AssetIcon,
  Button,
  ButtonSubText,
  ButtonText,
  Card,
  ChevronRightIcon,
  Delta,
  Divider,
  Gutter,
  Pressable,
  Screen,
  SegmentedControl,
  TAB_BAR_CLEARANCE,
  Text,
  colors,
  radius,
} from '../design-system'
import { account, instruments } from '../data/mock'
import { directionOf, formatLots, formatPercent, formatPrice } from '../data/format'
import type { RootStackParamList } from '../navigation/types'

type Navigation = NativeStackNavigationProp<RootStackParamList>

const ORDER_TYPES = ['Market', 'Limit', 'Stop'] as const
const LOT_STEP = 0.01
const CONTRACT_SIZE = 100
const LEVERAGE = 200

/**
 * Trade tab. Not in the supplied mockups — an order ticket assembled from the
 * existing primitives, with the same Sell / Buy pair the detail screen uses.
 */
export function TradeScreen() {
  const { navigate } = useNavigation<Navigation>()
  const [instrumentId, setInstrumentId] = useState(instruments[0].id)
  const [orderType, setOrderType] = useState<(typeof ORDER_TYPES)[number]>('Market')
  const [lots, setLots] = useState(0.5)

  const instrument = instruments.find((item) => item.id === instrumentId) ?? instruments[0]
  const margin = (instrument.price * CONTRACT_SIZE * lots) / LEVERAGE
  const spread = instrument.ask - instrument.bid

  const cycleInstrument = () => {
    const index = instruments.findIndex((item) => item.id === instrumentId)
    setInstrumentId(instruments[(index + 1) % instruments.length].id)
  }

  return (
    <Screen>
      <Gutter style={styles.titleRow}>
        <Text variant="title">Trade</Text>
        <View style={styles.accountPill}>
          <Text variant="body">
            {account.mode} · {account.number}
          </Text>
        </View>
      </Gutter>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Gutter>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Change instrument"
            onPress={cycleInstrument}
          >
            <Card style={styles.instrument}>
              <AssetIcon
                kind={instrument.icon}
                label={instrument.iconLabel}
                tint={instrument.iconTint}
                size={42}
              />
              <View style={styles.instrumentIdentity}>
                <Text variant="strong">{instrument.symbol}</Text>
                <Text variant="caption" color={colors.textMuted}>
                  {instrument.description}
                </Text>
              </View>
              <View style={styles.instrumentQuote}>
                <Text variant="strong">{formatPrice(instrument.price, instrument.precision)}</Text>
                <Delta
                  label={formatPercent(instrument.changePercent)}
                  direction={directionOf(instrument.changePercent)}
                  size={15}
                />
              </View>
              <ChevronRightIcon size={20} color={colors.textSubtle} />
            </Card>
          </Pressable>
        </Gutter>

        <Gutter>
          <SegmentedControl options={ORDER_TYPES} value={orderType} onChange={setOrderType} />
        </Gutter>

        <Gutter>
          <Card style={styles.volume}>
            <Text variant="body" color={colors.textMuted}>
              Volume
            </Text>
            <View style={styles.stepper}>
              <Stepper label="−" onPress={() => setLots((prev) => Math.max(LOT_STEP, round(prev - LOT_STEP)))} />
              <Text variant="displaySm" style={styles.lots}>
                {formatLots(lots)}
              </Text>
              <Stepper label="+" onPress={() => setLots((prev) => round(prev + LOT_STEP))} />
            </View>
          </Card>
        </Gutter>

        <Gutter>
          <Card style={styles.summary}>
            <SummaryRow label="Required margin" value={`$${margin.toFixed(2)}`} />
            <Divider />
            <SummaryRow label="Spread" value={formatPrice(spread, instrument.precision)} />
            <Divider />
            <SummaryRow label="Contract size" value={`${CONTRACT_SIZE} / lot`} />
            <Divider />
            <SummaryRow label="Leverage" value={`1:${LEVERAGE}`} />
          </Card>
        </Gutter>

        <Gutter>
          <Text variant="caption" color={colors.textMuted} style={styles.disclaimer}>
            Order placement is disabled in this build. Confirmation is required before any order
            reaches the trading API.
          </Text>
        </Gutter>
      </ScrollView>

      <Gutter style={styles.actions}>
        <Button tone="ink" style={styles.action} onPress={() => navigate('Instrument', { instrumentId })}>
          <ButtonText tone="ink">Sell</ButtonText>
          <ButtonSubText tone="ink">{formatPrice(instrument.bid, instrument.precision)}</ButtonSubText>
        </Button>
        <Button tone="gold" style={styles.action} onPress={() => navigate('Instrument', { instrumentId })}>
          <ButtonText tone="gold">Buy</ButtonText>
          <ButtonSubText tone="gold">{formatPrice(instrument.ask, instrument.precision)}</ButtonSubText>
        </Button>
      </Gutter>
    </Screen>
  )
}

function Stepper({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.stepperButton}>
      <Text variant="heading">{label}</Text>
    </Pressable>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text variant="body" color={colors.textMuted}>
        {label}
      </Text>
      <Text variant="strong">{value}</Text>
    </View>
  )
}

/** Keeps lot sizes free of binary floating-point drift in the display. */
function round(value: number) {
  return Math.round(value * 100) / 100
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 16,
  },
  accountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  content: {
    paddingBottom: 24,
    gap: 14,
  },
  instrument: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 20,
  },
  instrumentIdentity: {
    flex: 1,
    gap: 3,
  },
  instrumentQuote: {
    alignItems: 'flex-end',
    gap: 5,
  },
  volume: {
    padding: 16,
    borderRadius: 20,
    gap: 12,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderCurve: 'continuous',
    backgroundColor: colors.track,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lots: {
    fontSize: 24,
  },
  summary: {
    padding: 16,
    borderRadius: 20,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  disclaimer: {
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: TAB_BAR_CLEARANCE - 36,
  },
  action: {
    flex: 1,
  },
})
