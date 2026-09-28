import { useNavigation } from '@react-navigation/native'
import { Platform, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { colors } from './colors'
import { Pressable } from './pressable'
import { Text } from './text'
import { SCREEN_PADDING, fonts, radius } from './tokens'

/**
 * Chrome for the screens presented as native form sheets.
 *
 * The sheet itself is the navigator's (`presentation: 'formSheet'`), so
 * swipe-to-dismiss, the backdrop and keyboard avoidance all come from the
 * platform. This only draws the grabber, title and Close affordance.
 */
export function Sheet({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  /** Pinned under the scroll area — the primary action usually lives here. */
  footer?: React.ReactNode
}) {
  const { goBack } = useNavigation()
  const insets = useSafeAreaInsets()

  return (
    <View style={styles.root}>
      {/* iOS draws its own grabber on a form sheet. */}
      {Platform.OS === 'ios' ? null : <View style={styles.grabber} />}

      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="heading" style={styles.title}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="caption" color={colors.textMuted}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={10}
          onPress={goBack}
          style={styles.close}
        >
          <Text style={styles.closeLabel}>Close</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>

      {footer ? (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>{footer}</View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 18,
    paddingBottom: 14,
    gap: 16,
  },
  headerText: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 22,
  },
  close: {
    paddingTop: 4,
  },
  closeLabel: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.textMuted,
  },
  content: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: 20,
    gap: 14,
  },
  footer: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    backgroundColor: colors.surface,
  },
})
