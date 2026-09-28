import { StyleSheet, View } from 'react-native'
import Svg, { Circle, G, Path } from 'react-native-svg'

import { colors } from './colors'
import { Text } from './text'
import { fonts } from './tokens'

export type AssetIconKind = 'gold' | 'silver' | 'euro' | 'bitcoin' | 'ethereum' | 'oil' | 'generic'

export type AssetIconProps = {
  kind: AssetIconKind
  size?: number
  /** Shown by the `generic` kind — one or two letters. */
  label?: string
  /** Shown by the `generic` kind. */
  tint?: string
}

/** Three stacked bullion bars — XAU and XAG. */
function Bullion({ size, tint }: { size: number; tint: string }) {
  return (
    <Svg width={size} height={size * 0.92} viewBox="0 0 48 44">
      <G fill={tint} stroke={tint} strokeWidth={3} strokeLinejoin="round">
        <Path d="M17.5 5.5h13l3.5 15h-20Z" />
        <Path d="M6.5 24.5h12l3.5 14H3Z" />
        <Path d="M29.5 24.5h12L45 38.5H26Z" />
      </G>
    </Svg>
  )
}

/** Circle of twelve stars on the EU blue disc. */
function EuroFlag({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Circle cx="24" cy="24" r="24" fill={colors.euBlue} />
      <G fill={colors.euStar}>
        {STAR_ANGLES.map((angle) => {
          const rad = (angle * Math.PI) / 180
          return (
            <Path
              key={angle}
              d={STAR_PATH}
              transform={`translate(${24 + 14.5 * Math.sin(rad)} ${24 - 14.5 * Math.cos(rad)})`}
            />
          )
        })}
      </G>
    </Svg>
  )
}

/** Twelve evenly spaced positions, clock-face order. */
const STAR_ANGLES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]

/** A five-pointed star with its centroid at the origin, radius ~3.2. */
const STAR_PATH = 'M0 -3.2 0.94 -1 3.2 -1 1.4 0.4 2.1 2.6 0 1.3 -2.1 2.6 -1.4 0.4 -3.2 -1 -0.94 -1Z'

/**
 * Round instrument badge. Everything other than the drawn marks falls back
 * to a tinted disc with the instrument's initials.
 */
export function AssetIcon({ kind, size = 44, label = '', tint }: AssetIconProps) {
  if (kind === 'gold' || kind === 'silver') {
    const bullionTint = tint ?? (kind === 'gold' ? colors.gold : '#B9C0C7')
    return (
      <View style={[styles.box, { width: size, height: size }]}>
        <Bullion size={size * 0.94} tint={bullionTint} />
      </View>
    )
  }

  if (kind === 'euro') {
    return (
      <View style={[styles.box, { width: size, height: size }]}>
        <EuroFlag size={size} />
      </View>
    )
  }

  const disc = kind === 'bitcoin' ? colors.bitcoin : kind === 'ethereum' ? '#627EEA' : (tint ?? colors.ink)
  const glyph = kind === 'bitcoin' ? '₿' : kind === 'ethereum' ? 'Ξ' : kind === 'oil' ? '◆' : label

  return (
    <View
      style={[
        styles.box,
        styles.disc,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: disc },
      ]}
    >
      <Text style={[styles.glyph, { fontSize: size * 0.5 }]}>{glyph}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disc: {
    overflow: 'hidden',
  },
  glyph: {
    fontFamily: fonts.bold,
    color: colors.surface,
    includeFontPadding: false,
    textAlign: 'center',
  },
})
