import { FlashList } from '@shopify/flash-list'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useState } from 'react'
import { ScrollView, StyleSheet, TextInput, View } from 'react-native'

import {
  Gutter,
  Pressable,
  SCREEN_PADDING,
  Screen,
  SearchIcon,
  StarIcon,
  TAB_BAR_CLEARANCE,
  Text,
  colors,
  fonts,
  radius,
} from '../design-system'
import { MarketRow } from '../features/markets/market-row'
import { instruments } from '../data/mock'
import type { Instrument } from '../data/types'
import type { RootStackParamList } from '../navigation/types'

type Navigation = NativeStackNavigationProp<RootStackParamList>

const FILTERS = ['Favorites', 'All', 'Forex', 'Metals', 'Crypto', 'Energy'] as const
type Filter = (typeof FILTERS)[number]

/**
 * Markets tab. Not in the supplied mockups — built from the same primitives
 * so it sits alongside Market Watch without introducing new visual rules.
 */
export function MarketsScreen() {
  const { navigate } = useNavigation<Navigation>()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('All')

  const needle = query.trim().toLowerCase()
  const rows = instruments.filter((item) => {
    const matchesFilter =
      filter === 'All' ||
      (filter === 'Favorites' ? item.favorite : item.category === filter)
    if (!matchesFilter) return false
    if (!needle) return true
    return (
      item.symbol.toLowerCase().includes(needle) || item.name.toLowerCase().includes(needle)
    )
  })

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
    <Screen>
      <Gutter style={styles.titleRow}>
        <Text variant="title">Markets</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Show favourites"
          hitSlop={8}
          onPress={() => setFilter('Favorites')}
        >
          <StarIcon size={24} color={colors.text} filled={filter === 'Favorites'} />
        </Pressable>
      </Gutter>

      <Gutter style={styles.search}>
        <View style={styles.searchField}>
          <SearchIcon size={22} color={colors.text} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search markets"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            returnKeyType="search"
            autoCorrect={false}
          />
        </View>
      </Gutter>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipStrip}
      >
        {FILTERS.map((item) => {
          const selected = item === filter
          return (
            <Pressable
              key={item}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => setFilter(item)}
              style={[styles.chip, selected ? styles.chipSelected : null]}
            >
              <Text style={[styles.chipLabel, selected ? styles.chipLabelSelected : null]}>
                {item}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>

      <FlashList
        data={rows}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={Empty}
      />
    </Screen>
  )
}

const keyExtractor = (item: Instrument) => item.id
const Separator = () => <View style={styles.separator} />

const Empty = () => (
  <View style={styles.empty}>
    <Text variant="body" color={colors.textMuted}>
      No markets match that search.
    </Text>
  </View>
)

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  search: {
    marginTop: 18,
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
    padding: 0,
  },

  chipStrip: {
    flexGrow: 0,
    marginTop: 16,
  },
  chips: {
    paddingHorizontal: SCREEN_PADDING,
    gap: 8,
  },
  chip: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    borderCurve: 'continuous',
    backgroundColor: colors.track,
  },
  chipSelected: {
    backgroundColor: colors.gold,
  },
  chipLabel: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  chipLabelSelected: {
    fontFamily: fonts.bold,
  },

  list: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 16,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  separator: {
    height: 14,
  },
  empty: {
    paddingTop: 48,
    alignItems: 'center',
  },
})
