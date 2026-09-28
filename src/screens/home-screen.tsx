import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ScrollView, StyleSheet, View } from 'react-native'

import {
  AssetIcon,
  Avatar,
  BellIcon,
  BoltIcon,
  Card,
  Delta,
  Divider,
  Gutter,
  PressableScale,
  Pressable,
  Screen,
  TAB_BAR_CLEARANCE,
  Text,
  TrendUpIcon,
  Watermark,
  colors,
} from '../design-system'
import { SectionHeader } from '../features/shared/section-header'
import { account, instrumentsById, signals } from '../data/mock'
import { directionOf, formatMoney, formatPercent } from '../data/format'
import type { HomeStackParamList } from '../navigation/types'

type Navigation = NativeStackNavigationProp<HomeStackParamList, 'Dashboard'>

/** Home tab: greeting, portfolio summary, two stat tiles and the signal feed. */
export function HomeScreen() {
  const { navigate } = useNavigation<Navigation>()
  const signal = signals[0]
  const signalInstrument = instrumentsById.get(signal.instrumentId)

  return (
    <Screen>
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Gutter style={styles.greetingRow}>
          <Text variant="heading" weight="regular" style={styles.greeting}>
            Hello,{' '}
            <Text variant="heading" weight="extrabold" style={styles.greeting}>
              {account.holder.split(' ')[0]}!
            </Text>
          </Text>
          <View style={styles.greetingActions}>
            <Pressable accessibilityRole="button" accessibilityLabel="Notifications" hitSlop={8}>
              <BellIcon size={26} color={colors.text} />
              <View style={styles.bellDot} />
            </Pressable>
            <Avatar uri={account.avatarUrl} size={48} />
          </View>
        </Gutter>

        <Gutter>
          <PressableScale onPress={() => navigate('Balance')} scaleTo={0.985}>
            <View style={styles.portfolio}>
              <View style={styles.portfolioBand}>
                <Text variant="strong">Your Portfolio</Text>
                <Text variant="body">{account.asOf}</Text>
              </View>

              <View style={styles.portfolioBody}>
                <Watermark size={150} right={-24} bottom={-30} />
                <View style={styles.portfolioMeta}>
                  <Text variant="body" color={colors.onInkMuted}>
                    Total Equity
                  </Text>
                  <Delta
                    label={formatPercent(account.changePercent)}
                    direction={directionOf(account.changePercent)}
                    onInk
                  />
                </View>
                <Text variant="display" color={colors.onInk}>
                  {formatMoney(account.equity)}
                </Text>
              </View>
            </View>
          </PressableScale>
        </Gutter>

        <Gutter style={styles.tiles}>
          {/* Design-only figures: the integration guide has no endpoint behind
              either metric, so they are presented as static marketing copy. */}
          <Card style={styles.tile}>
            <Text variant="caption" color={colors.textMuted} style={styles.tileLabel}>
              Market Sentiment
            </Text>
            <View style={styles.tileValue}>
              <Text variant="heading" style={styles.tileHeadline}>
                Bullish
              </Text>
              <TrendUpIcon size={22} color={colors.green} />
            </View>
            <View style={styles.tileFooter}>
              <Text variant="caption" weight="bold" color={colors.green} style={styles.tileFine}>
                {formatPercent(account.changePercent)}
              </Text>
              <Text variant="caption" color={colors.textMuted} style={styles.tileFine}>
                last 7 days
              </Text>
            </View>
          </Card>

          <Card style={styles.tile}>
            <Text variant="caption" color={colors.textMuted} style={styles.tileLabel}>
              Execution
            </Text>
            <View style={styles.tileValue}>
              <Text variant="heading" style={styles.tileHeadline}>
                &lt;50ms
              </Text>
              <BoltIcon size={22} color={colors.gold} />
            </View>
            <View style={styles.tileFooter}>
              <Text variant="caption" style={styles.tileFine}>
                Fast. Reliable. Global.
              </Text>
            </View>
          </Card>
        </Gutter>

        <Gutter style={styles.section}>
          <SectionHeader title="Trading Signals" action="See more" />
        </Gutter>

        <Gutter>
          <Card style={styles.signal}>
            <View style={styles.signalHeader}>
              {signalInstrument ? (
                <AssetIcon
                  kind={signalInstrument.icon}
                  label={signalInstrument.iconLabel}
                  tint={signalInstrument.iconTint}
                  size={40}
                />
              ) : null}
              <View style={styles.signalIdentity}>
                <Text variant="strong">{signalInstrument?.symbol}</Text>
                <Text variant="caption" color={colors.textMuted}>
                  {signalInstrument?.description}
                </Text>
              </View>
            </View>

            <Text style={styles.signalHeadline}>{signal.headline}</Text>

            <Divider />

            <View style={styles.signalFooter}>
              <Text variant="caption" color={colors.textMuted}>
                {signal.date}
              </Text>
              <Text variant="caption" color={colors.textMuted}>
                {signal.source}
              </Text>
            </View>
          </Card>
        </Gutter>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 12,
    paddingBottom: TAB_BAR_CLEARANCE,
    gap: 18,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: 24,
    lineHeight: 30,
  },
  greetingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bellDot: {
    position: 'absolute',
    top: -1,
    right: -2,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.gold,
  },

  portfolio: {
    borderRadius: 24,
    borderCurve: 'continuous',
    backgroundColor: colors.ink,
    overflow: 'hidden',
  },
  // Rounded on all four corners: the bottom pair reveals the dark card behind.
  portfolioBand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.gold,
    borderRadius: 24,
    borderCurve: 'continuous',
    paddingHorizontal: 20,
    paddingVertical: 17,
  },
  portfolioBody: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 22,
    gap: 6,
  },
  portfolioMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  tiles: {
    flexDirection: 'row',
    gap: 12,
  },
  tile: {
    flex: 1,
    padding: 15,
    borderRadius: 20,
    gap: 8,
  },
  tileLabel: {
    fontSize: 15,
  },
  tileHeadline: {
    fontSize: 21,
  },
  tileValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  tileFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  tileFine: {
    fontSize: 13,
  },

  section: {
    paddingTop: 2,
  },
  signal: {
    padding: 18,
    borderRadius: 20,
    gap: 14,
  },
  signalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  signalIdentity: {
    gap: 3,
  },
  signalHeadline: {
    fontSize: 19,
    lineHeight: 26,
    color: colors.text,
  },
  signalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})
