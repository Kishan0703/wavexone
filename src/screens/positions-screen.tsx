import { FlashList } from '@shopify/flash-list'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import {
  ChevronDownIcon,
  Gutter,
  Pressable,
  SCREEN_PADDING,
  Screen,
  SegmentedControl,
  TAB_BAR_CLEARANCE,
  Text,
  Watermark,
  colors,
  radius,
} from '../design-system'
import { PositionCard } from '../features/positions/position-card'
import { account, instrumentsById, positions } from '../data/mock'
import { formatSignedMoney } from '../data/format'
import type { Position } from '../data/types'

const TABS = ['Open', 'Pending', 'Closed'] as const

const ACTION_LABEL: Record<(typeof TABS)[number], string> = {
  Open: 'Close position',
  Pending: 'Cancel order',
  Closed: 'View details',
}

/** Positions tab: floating P&L, state filter, and the position cards. */
export function PositionsScreen() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Open')

  const rows = positions.filter((item) => item.state === tab)
  const openCount = positions.filter((item) => item.state === 'Open').length

  // Confirmation is required before anything reaches the trading API, so the
  // footer button is a no-op until that flow exists.
  const onAction = (_id: string) => {}
  const onMenu = (_id: string) => {}

  const renderItem = ({ item }: { item: Position }) => {
    const instrument = instrumentsById.get(item.instrumentId)
    if (!instrument) return null

    return (
      <PositionCard
        id={item.id}
        symbol={instrument.symbol}
        description={instrument.description}
        iconKind={instrument.icon}
        iconLabel={instrument.iconLabel}
        iconTint={instrument.iconTint}
        side={item.side}
        lots={item.lots}
        entry={item.entry}
        current={item.current}
        precision={instrument.precision}
        pnl={item.pnl}
        actionLabel={ACTION_LABEL[tab]}
        onAction={onAction}
        onMenu={onMenu}
      />
    )
  }

  return (
    <Screen>
      <Gutter style={styles.titleRow}>
        <Text variant="title">Positions</Text>
        <Pressable accessibilityRole="button" style={styles.accountPill}>
          <Text variant="body">
            {account.mode} · {account.number}
          </Text>
          <ChevronDownIcon size={20} color={colors.text} />
        </Pressable>
      </Gutter>

      <Gutter>
        <View style={styles.summary}>
          <Watermark size={150} right={-26} bottom={-26} />
          <Text variant="body" color={colors.onInk} style={styles.summaryLabel}>
            Floating P&amp;L
          </Text>
          <Text
            variant="display"
            color={account.floatingPnl < 0 ? colors.red : colors.greenOnInk}
            style={styles.summaryValue}
          >
            {formatSignedMoney(account.floatingPnl)}
          </Text>
          <Text variant="body" color={colors.onInkMuted}>
            {openCount} open {openCount === 1 ? 'position' : 'positions'}
          </Text>
        </View>
      </Gutter>

      <Gutter style={styles.tabs}>
        <SegmentedControl options={TABS} value={tab} onChange={setTab} />
      </Gutter>

      <FlashList
        data={rows}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="body" color={colors.textMuted}>
              Nothing here yet.
            </Text>
          </View>
        }
      />
    </Screen>
  )
}

const keyExtractor = (item: Position) => item.id
const Separator = () => <View style={styles.separator} />

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
    height: 46,
    paddingLeft: 18,
    paddingRight: 14,
    borderRadius: radius.pill,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  summary: {
    backgroundColor: colors.ink,
    borderRadius: 24,
    borderCurve: 'continuous',
    paddingHorizontal: 20,
    paddingVertical: 20,
    overflow: 'hidden',
  },
  summaryLabel: {
    fontSize: 17,
  },
  summaryValue: {
    marginTop: 6,
    marginBottom: 6,
    fontSize: 38,
    lineHeight: 46,
  },

  tabs: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  list: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  separator: {
    height: 14,
  },
  empty: {
    paddingTop: 40,
    alignItems: 'center',
  },
})
