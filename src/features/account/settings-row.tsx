import { StyleSheet, View } from 'react-native'

import {
  Card,
  ChevronRightIcon,
  Divider,
  Pressable,
  Text,
  colors,
} from '../../design-system'

export type SettingsRowProps = {
  icon: React.ReactNode
  label: string
  onPress?: () => void
  /** Hairline below the row; omitted on the last row of a group. */
  divider?: boolean
}

/** One line in an Account menu group. */
export function SettingsRow({ icon, label, onPress, divider = true }: SettingsRowProps) {
  return (
    <View>
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
        <View style={styles.icon}>{icon}</View>
        <Text style={styles.label}>{label}</Text>
        <ChevronRightIcon size={20} color={colors.textSubtle} />
      </Pressable>
      {divider ? <Divider inset={54} /> : null}
    </View>
  )
}

/** Card that groups a run of `SettingsRow`s. */
export function SettingsGroup({ children }: { children: React.ReactNode }) {
  return <Card padded={false} style={styles.group}>{children}</Card>
}

const styles = StyleSheet.create({
  group: {
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    gap: 16,
  },
  icon: {
    width: 26,
    alignItems: 'center',
  },
  label: {
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
    color: colors.text,
  },
})
