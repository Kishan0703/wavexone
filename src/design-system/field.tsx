import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native'

import { colors } from './colors'
import { Pressable } from './pressable'
import { Text } from './text'
import { fonts, radius } from './tokens'

export type FieldProps = TextInputProps & {
  label: string
  /** Leading adornment, e.g. a currency symbol. */
  prefix?: string
  /** Helper or validation copy under the field. */
  hint?: string
  invalid?: boolean
}

/** Labelled text input used by the funding and order sheets. */
export function Field({ label, prefix, hint, invalid = false, style, ...rest }: FieldProps) {
  return (
    <View style={styles.wrap}>
      <Text variant="caption" color={colors.textMuted}>
        {label}
      </Text>

      <View style={[styles.box, invalid ? styles.boxInvalid : null]}>
        {prefix ? (
          <Text variant="strong" color={colors.textMuted}>
            {prefix}
          </Text>
        ) : null}
        <TextInput
          {...rest}
          placeholderTextColor={colors.textSubtle}
          style={[styles.input, style]}
        />
      </View>

      {hint ? (
        <Text variant="caption" color={invalid ? colors.red : colors.textMuted}>
          {hint}
        </Text>
      ) : null}
    </View>
  )
}

/** Row of preset values that fill a `Field` in one tap. */
export function QuickPicks({
  values,
  selected,
  onSelect,
  format,
}: {
  values: readonly number[]
  selected?: number
  onSelect: (value: number) => void
  format: (value: number) => string
}) {
  return (
    <View style={styles.picks}>
      {values.map((value) => {
        const active = value === selected
        return (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityLabel={format(value)}
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(value)}
            style={[styles.pick, active ? styles.pickActive : null]}
          >
            <Text style={[styles.pickLabel, active ? styles.pickLabelActive : null]}>
              {format(value)}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 56,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  boxInvalid: {
    borderColor: colors.red,
  },
  input: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 17,
    color: colors.text,
    padding: 0,
  },
  picks: {
    flexDirection: 'row',
    gap: 8,
  },
  pick: {
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderCurve: 'continuous',
    backgroundColor: colors.track,
  },
  pickActive: {
    backgroundColor: colors.gold,
  },
  pickLabel: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.text,
  },
  pickLabelActive: {
    fontFamily: fonts.bold,
  },
})
