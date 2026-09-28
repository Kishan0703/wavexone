import { FlashList } from '@shopify/flash-list'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { StyleSheet, View } from 'react-native'

import {
  AssetIcon,
  Card,
  Divider,
  PressableScale,
  SCREEN_PADDING,
  Screen,
  TAB_BAR_CLEARANCE,
  Text,
  colors,
} from '../design-system'
import { ScreenHeader } from '../features/shared/screen-header'
import { instrumentsById, signals } from '../data/mock'
import type { Signal } from '../data/types'
import type { RootStackParamList } from '../navigation/types'

type Navigation = NativeStackNavigationProp<RootStackParamList>

/** The full feed behind "See more" on the dashboard. */
export function SignalsScreen() {
  const { navigate } = useNavigation<Navigation>()

  const open = (instrumentId: string) => navigate('Instrument', { instrumentId })

  const renderItem = ({ item }: { item: Signal }) => {
    const instrument = instrumentsById.get(item.instrumentId)
    if (!instrument) return null

    return (
      <PressableScale onPress={() => open(item.instrumentId)} scaleTo={0.99}>
        <Card style={styles.card}>
          <View style={styles.header}>
            <AssetIcon
              kind={instrument.icon}
              label={instrument.iconLabel}
              tint={instrument.iconTint}
              size={40}
            />
            <View style={styles.identity}>
              <Text variant="strong">{instrument.symbol}</Text>
              <Text variant="caption" color={colors.textMuted}>
                {instrument.description}
              </Text>
            </View>
          </View>

          <Text style={styles.headline}>{item.headline}</Text>
          <Text variant="body" color={colors.textMuted} style={styles.body}>
            {item.body}
          </Text>

          <Divider />

          <View style={styles.footer}>
            <Text variant="caption" color={colors.textMuted}>
              {item.date}
            </Text>
            <Text variant="caption" color={colors.textMuted}>
              {item.source}
            </Text>
          </View>
        </Card>
      </PressableScale>
    )
  }

  return (
    <Screen>
      <ScreenHeader title="Trading Signals" subtitle="WaveX Insight" />

      <FlashList
        data={signals}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  )
}

const keyExtractor = (item: Signal) => item.id
const Separator = () => <View style={styles.separator} />

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  separator: {
    height: 14,
  },
  card: {
    padding: 18,
    borderRadius: 20,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  identity: {
    gap: 3,
  },
  headline: {
    fontSize: 19,
    lineHeight: 26,
    color: colors.text,
  },
  body: {
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})
