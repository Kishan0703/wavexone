import { FlashList } from '@shopify/flash-list'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import {
  FilterIcon,
  Gutter,
  Pressable,
  SCREEN_PADDING,
  Screen,
  SegmentedControl,
  TAB_BAR_CLEARANCE,
  Text,
  VerticalDivider,
  Watermark,
  colors,
} from '../design-system'
import { ActivityRow } from '../features/activity/activity-row'
import { account, activity, instrumentsById } from '../data/mock'
import { formatSignedMoney } from '../data/format'
import type { ActivityEntry } from '../data/types'

const TABS = ['Trades', 'Funds', 'Orders'] as const

type ListItem =
  | { type: 'header'; id: string; title: string }
  | { type: 'entry'; id: string; entry: ActivityEntry }

/** Activity: month summary, a Trades / Funds / Orders filter, grouped history. */
export function ActivityScreen() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Trades')

  const items = buildItems(activity.filter((entry) => entry.tab === tab))
  const onMenu = (_id: string) => {}

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'header') {
      return (
        <Text variant="heading" style={styles.groupHeader}>
          {item.title}
        </Text>
      )
    }

    const instrument = item.entry.instrumentId
      ? instrumentsById.get(item.entry.instrumentId)
      : undefined

    return (
      <ActivityRow
        id={item.entry.id}
        kind={item.entry.kind}
        title={item.entry.title}
        subtitle={item.entry.subtitle}
        date={item.entry.date}
        time={item.entry.time}
        amount={item.entry.amount}
        iconKind={instrument?.icon}
        iconLabel={instrument?.iconLabel}
        iconTint={instrument?.iconTint}
        onMenu={onMenu}
      />
    )
  }

  return (
    <Screen>
      <Gutter style={styles.titleRow}>
        <Text variant="title">Activity</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Filter activity" hitSlop={8}>
          <FilterIcon size={24} color={colors.text} />
        </Pressable>
      </Gutter>

      <Gutter>
        <View style={styles.summary}>
          <Watermark size={140} right={-22} top={-24} />
          <Text variant="strong" color={colors.onInk} style={styles.summaryTitle}>
            This month
          </Text>

          <View style={styles.summaryBody}>
            <View style={styles.summaryLeft}>
              <Text variant="body" color={colors.onInkMuted}>
                Net result
              </Text>
              <Text
                variant="display"
                color={account.monthNetResult < 0 ? colors.red : colors.greenOnInk}
                style={styles.summaryValue}
              >
                {formatSignedMoney(account.monthNetResult)}
              </Text>
            </View>

            <VerticalDivider />

            <View style={styles.summaryRight}>
              <Text variant="body" color={colors.onInkMuted}>
                <Text variant="strong" color={colors.onInk}>
                  {account.monthTrades}
                </Text>
                {' trades'}
              </Text>
              <Text variant="body" color={colors.onInkMuted}>
                <Text variant="strong" color={colors.onInk}>
                  {account.monthWinRate}%
                </Text>
                {' win rate'}
              </Text>
            </View>
          </View>
        </View>
      </Gutter>

      <Gutter style={styles.tabs}>
        <SegmentedControl options={TABS} value={tab} onChange={setTab} />
      </Gutter>

      <FlashList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="body" color={colors.textMuted}>
              No {tab.toLowerCase()} in this period.
            </Text>
          </View>
        }
      />
    </Screen>
  )
}

/** Flattens the grouped history into header / entry rows for the virtualizer. */
function buildItems(entries: readonly ActivityEntry[]): ListItem[] {
  const items: ListItem[] = []
  let currentGroup: string | undefined

  for (const entry of entries) {
    if (entry.group !== currentGroup) {
      currentGroup = entry.group
      items.push({ type: 'header', id: `header-${entry.group}`, title: entry.group })
    }
    items.push({ type: 'entry', id: entry.id, entry })
  }

  return items
}

const keyExtractor = (item: ListItem) => item.id
/** Separate recycling pools so a header never recycles into a row. */
const getItemType = (item: ListItem) => item.type
const Separator = () => <View style={styles.separator} />

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 16,
  },

  summary: {
    backgroundColor: colors.ink,
    borderRadius: 24,
    borderCurve: 'continuous',
    padding: 20,
    overflow: 'hidden',
  },
  summaryTitle: {
    fontSize: 18,
  },
  summaryBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 14,
  },
  summaryLeft: {
    flex: 1,
    gap: 4,
  },
  summaryValue: {
    fontSize: 30,
    lineHeight: 38,
  },
  summaryRight: {
    width: 108,
    gap: 10,
  },

  tabs: {
    paddingTop: 16,
    paddingBottom: 18,
  },
  groupHeader: {
    fontSize: 19,
    paddingBottom: 12,
    paddingTop: 6,
  },
  list: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  separator: {
    height: 8,
  },
  empty: {
    paddingTop: 40,
    alignItems: 'center',
  },
})
