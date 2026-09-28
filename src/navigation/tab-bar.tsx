import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import {
  CandlesIcon,
  HomeIcon,
  MarketsIcon,
  MoreIcon,
  PositionsIcon,
  PositionsIconFilled,
  PressableScale,
  Text,
  colors,
  fonts,
  shadow,
} from '../design-system'
import type { TabParamList } from './types'

/**
 * Hand-drawn tab bar.
 *
 * A native tab bar cannot produce this layout — the centre "Trade" control is
 * a circle that breaks out above the bar, and the selected states differ per
 * tab (filled glyph, inverted badge, gold dots). Everything else in the app
 * uses native navigators.
 */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index
        const name = route.name as keyof TabParamList
        const { options } = descriptors[route.key]

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name)
          }
        }

        if (name === 'Trade') {
          return (
            <PressableScale key={route.key} onPress={onPress} scaleTo={0.9} style={styles.item}>
              <View style={styles.cradle}>
                <View style={styles.fab}>
                  <CandlesIcon size={26} color={colors.gold} />
                </View>
              </View>
              <Text style={[styles.label, focused ? styles.labelActive : null]}>
                {options.title ?? name}
              </Text>
            </PressableScale>
          )
        }

        return (
          <PressableScale key={route.key} onPress={onPress} scaleTo={0.9} style={styles.item}>
            <View
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              style={styles.glyph}
            >
              <TabGlyph name={name} focused={focused} />
            </View>
            <Text style={[styles.label, focused ? styles.labelActive : null]}>
              {options.title ?? name}
            </Text>
          </PressableScale>
        )
      })}
    </View>
  )
}

function TabGlyph({ name, focused }: { name: keyof TabParamList; focused: boolean }) {
  switch (name) {
    case 'Home':
      // Drawn solid in every state, exactly as in the mockups.
      return <HomeIcon size={25} color={colors.text} />
    case 'Markets':
      return <MarketsIcon size={25} color={colors.text} filled={focused} />
    case 'Positions':
      return focused ? <PositionsIconFilled size={25} /> : <PositionsIcon size={25} color={colors.text} />
    case 'More':
      return <MoreIcon size={25} color={focused ? colors.goldDeep : colors.text} />
    default:
      return null
  }
}

const FAB_SIZE = 58
const CRADLE_SIZE = 76

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingTop: 10,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 7,
  },
  glyph: {
    height: 28,
    justifyContent: 'center',
  },
  // White disc that reads as the bar bulging upward around the Trade button.
  cradle: {
    width: CRADLE_SIZE,
    height: CRADLE_SIZE,
    borderRadius: CRADLE_SIZE / 2,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -26,
    marginBottom: -22,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadow.fab,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 16,
    color: colors.text,
  },
  labelActive: {
    fontFamily: fonts.bold,
  },
})
