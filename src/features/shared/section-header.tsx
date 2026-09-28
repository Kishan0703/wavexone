import { StyleSheet, View } from 'react-native'

import { ChevronDownIcon, Pressable, Text, colors } from '../../design-system'

export type SectionHeaderProps = {
  title: string
  /** Right-hand affordance: "See more", "This month ⌄". */
  action?: string
  withChevron?: boolean
  onPressAction?: () => void
}

/** "Market Watch · This month ⌄" and "Trading Signals · See more". */
export function SectionHeader({
  title,
  action,
  withChevron = false,
  onPressAction,
}: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text variant="heading">{title}</Text>
      {action ? (
        <Pressable
          accessibilityRole="button"
          onPress={onPressAction}
          hitSlop={8}
          style={styles.action}
        >
          <Text style={styles.actionLabel}>{action}</Text>
          {withChevron ? <ChevronDownIcon size={18} color={colors.text} /> : null}
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionLabel: {
    fontSize: 16,
    color: colors.text,
  },
})
