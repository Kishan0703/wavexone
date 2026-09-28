import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg'

import { colors } from './colors'

export type SparklineProps = {
  /** Raw series; scaled to fit the box. */
  points: readonly number[]
  width?: number
  height?: number
  color?: string
  /** Unique per instance — SVG gradient ids are document-global. */
  gradientId: string
}

/**
 * The little trend line on each Market Watch row: a stroked path plus a
 * soft area wash that fades out before it reaches the baseline.
 */
export function Sparkline({
  points,
  width = 108,
  height = 44,
  color = colors.green,
  gradientId,
}: SparklineProps) {
  const { line, area } = buildPaths(points, width, height)

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.22} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={area} fill={`url(#${gradientId})`} />
      <Path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

const PADDING = 4

function buildPaths(points: readonly number[], width: number, height: number) {
  if (points.length < 2) return { line: '', area: '' }

  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min || 1
  const usable = height - PADDING * 2
  const step = width / (points.length - 1)

  const coords = points.map((value, index) => {
    const x = index * step
    const y = PADDING + (1 - (value - min) / span) * usable
    return `${x.toFixed(2)} ${y.toFixed(2)}`
  })

  const line = `M${coords.join(' L')}`
  const area = `${line} L${width} ${height} L0 ${height} Z`
  return { line, area }
}
