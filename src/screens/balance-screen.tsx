import { FlashList } from '@shopify/flash-list'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useState } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import {
  CardPlusIcon,
  CircleAction,
  Gutter,
  Logo,
  SCREEN_PADDING,
  Screen,
  SearchIcon,
  TAB_BAR_CLEARANCE,
  Text,
  Watermark,
  colors,
  fonts,
} from '../design-system'
import { MarketRow } from '../features/markets/market-row'
import { SectionHeader } from '../features/shared/section-header'
import { account, marketWatch } from '../data/mock'
import { formatMoney } from '../data/format'
import type { Instrument } from '../data/types'
import type { RootStackParamList } from '../navigation/types'

type Navigation = NativeStackNavigationProp<RootStackParamList>

/**
 * "Your Balance": full-bleed dark header with the funding actions, then
 * search and Market Watch.
 */
export function BalanceScreen() {
  const { navigate } = useNavigation<Navigation>()
  const [query, setQuery] = useState('')

  const needle = query.trim().toLowerCase()
  const rows = needle
    ? marketWatch.filter(
        (item) =>
          item.symbol.toLowerCase().includes(needle) || item.name.toLowerCase().includes(needle),
      )
    : marketWatch

  const openInstrument = (instrumentId: string) => {
    navigate('Instrument', { instrumentId })
  }

  const renderItem = ({ item }: { item: Instrument }) => (
    <MarketRow
      id={item.id}
      symbol={item.symbol}
      name={item.name}
      price={item.price}
      precision={item.precision}
      changePercent={item.changePercent}
      iconKind={item.icon}
      iconLabel={item.iconLabel}
      iconTint={item.iconTint}
      spark={item.spark}
      sparkTone={item.sparkTone}
      onPress={openInstrument}
    />
  )

  return (
    <Screen edges={[]}>
      <FlashList
        data={rows}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={<BalanceHeader query={query} onChangeQuery={setQuery} />}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  )
}

function BalanceHeader({
  query,
  onChangeQuery,
}: {
  query: string
  onChangeQuery: (value: string) => void
}) {
  const insets = useSafeAreaInsets()

  return (
    <View style={styles.header}>
      <View style={[styles.panel, { paddingTop: insets.top + 14 }]}>
        <Watermark size={168} right={-56} bottom={136} />

        <View style={styles.logoRow}>
          <Logo size={21} tone="dark" />
        </View>

        <Text variant="body" color={colors.onInk} style={styles.balanceLabel}>
          Your Balance
        </Text>
        <Text variant="display" color={colors.onInk} style={styles.balanceValue}>
          {formatMoney(account.equity)}
        </Text>

        <View style={styles.actions}>
          <CircleAction label="Deposit">
            <CardPlusIcon size={24} color={colors.onInk} />
          </CircleAction>
          <CircleAction label="Withdraw">
            <CardPlusIcon size={24} color={colors.onInk} />
          </CircleAction>
          <CircleAction label="Transfer" tone="gold">
            <CardPlusIcon size={24} color={colors.ink} />
          </CircleAction>
        </View>
      </View>

      <Gutter style={styles.search}>
        <View style={styles.searchField}>
          <SearchIcon size={22} color={colors.text} />
          <TextInput
            value={query}
            onChangeText={onChangeQuery}
            placeholder="Search markets"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            returnKeyType="search"
            autoCorrect={false}
          />
        </View>
      </Gutter>

      <Gutter style={styles.sectionHeader}>
        <SectionHeader title="Market Watch" action="This month" withChevron />
      </Gutter>
    </View>
  )
}

const keyExtractor = (item: Instrument) => item.id
const Separator = () => <View style={styles.separator} />

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  separator: {
    height: 14,
  },
  header: {
    // Cancels the list's gutter so the dark panel can bleed edge to edge.
    marginHorizontal: -SCREEN_PADDING,
  },
  panel: {
    backgroundColor: colors.ink,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    borderCurve: 'continuous',
    paddingHorizontal: 22,
    paddingBottom: 22,
    overflow: 'hidden',
  },
  logoRow: {
    alignItems: 'center',
  },
  balanceLabel: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 17,
  },
  balanceValue: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 36,
    lineHeight: 44,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 22,
    backgroundColor: colors.onInkPanel,
    borderRadius: 28,
    borderCurve: 'continuous',
    paddingVertical: 18,
    paddingHorizontal: 8,
  },

  search: {
    marginTop: 22,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 56,
    borderRadius: 28,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 17,
    color: colors.text,
    // Keeps the caret on the same baseline across platforms.
    padding: 0,
  },

  sectionHeader: {
    marginTop: 24,
    marginBottom: 14,
  },
})
