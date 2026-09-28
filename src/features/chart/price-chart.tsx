import { useState } from 'react'
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native'
import Svg, { Circle, Defs, LinearGradient, Line, Path, Rect, Stop } from 'react-native-svg'

import { Card, DeltaTriangle, Text, colors, fonts } from '../../design-system'
import { formatPrice } from '../../data/format'

export type PriceChartProps = {
  series: readonly number[]
  /** Column labels; the plot is divided into this many equal sections. */
  months: readonly string[]
  /** Index in `series` the crosshair reads. */
  cursorIndex: number
  cursorOpen: number
  cursorClose: number
  /** Axis bounds — fixed rather than derived so the labels stay round. */
  min: number
  max: number
  step: number
}

type Size = { width: number; height: number }

const AXIS_GUTTER = 50
const MONTH_ROW = 34

/**
 * The XAU/USD chart.
 *
 * Drawn by hand with react-native-svg: a charting library cannot reproduce
 * the dashed crosshair, the gold cursor dot and the floating open/close
 * tooltip exactly as specified, and the series is static here anyway.
 *
 * The plot fills whatever space the parent gives it, so the card reaches the
 * Sell / Buy pair on every screen height.
 */
export function PriceChart({
  series,
  months,
  cursorIndex,
  cursorOpen,
  cursorClose,
  min,
  max,
  step,
}: PriceChartProps) {
  // undefined until the first layout pass; nothing is drawn before then.
  const [size, setSize] = useState<Size | undefined>(undefined)

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout
    setSize((previous) => {
      if (previous?.width === width && previous?.height === height) return previous
      return { width, height }
    })
  }

  const ticks = buildTicks(min, max, step)

  return (
    <Card style={styles.card}>
      <View style={styles.plotRow}>
        <View style={styles.plot} onLayout={onLayout}>
          {size === undefined ? null : (
            <Plot
              size={size}
              series={series}
              columns={months.length}
              rows={ticks.length - 1}
              cursorIndex={cursorIndex}
              min={min}
              max={max}
            />
          )}
        </View>

        <View style={styles.axis}>
          {ticks.map((tick, index) => (
            <Text
              key={tick}
              variant="caption"
              color={colors.textMuted}
              style={[
                styles.axisLabel,
                { top: (index / (ticks.length - 1)) * (size?.height ?? 0) - 9 },
              ]}
            >
              {tick}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.months}>
        {months.map((month) => (
          <Text key={month} variant="caption" color={colors.textMuted} style={styles.month}>
            {month}
          </Text>
        ))}
      </View>

      {size === undefined ? null : (
        <Tooltip
          open={cursorOpen}
          close={cursorClose}
          left={cursorX(size.width, series.length, cursorIndex)}
          top={cursorY(size.height, min, max, series[cursorIndex] ?? min)}
        />
      )}
    </Card>
  )
}

function Plot({
  size,
  series,
  columns,
  rows,
  cursorIndex,
  min,
  max,
}: {
  size: Size
  series: readonly number[]
  columns: number
  rows: number
  cursorIndex: number
  min: number
  max: number
}) {
  const { width, height } = size
  const stepX = width / (series.length - 1)
  const toY = (value: number) => ((max - value) / (max - min)) * height

  const points = series.map(
    (value, index) => `${(index * stepX).toFixed(2)} ${toY(value).toFixed(2)}`,
  )
  const line = `M${points.join(' L')}`
  const area = `${line} L${width} ${height} L0 ${height} Z`

  const cx = cursorX(width, series.length, cursorIndex)
  const cy = toY(series[cursorIndex] ?? min)

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="chart-wash" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.gold} stopOpacity={0.16} />
          <Stop offset="1" stopColor={colors.gold} stopOpacity={0} />
        </LinearGradient>
      </Defs>

      {/* Horizontal gridlines, one per axis tick. */}
      {range(rows + 1).map((index) => (
        <Line
          key={`h-${index}`}
          x1={0}
          x2={width}
          y1={(index / rows) * height}
          y2={(index / rows) * height}
          stroke={colors.grid}
          strokeWidth={1}
        />
      ))}

      {/* Vertical gridlines between month columns. */}
      {range(columns - 1).map((index) => (
        <Line
          key={`v-${index}`}
          x1={((index + 1) / columns) * width}
          x2={((index + 1) / columns) * width}
          y1={0}
          y2={height}
          stroke={colors.grid}
          strokeWidth={1}
        />
      ))}

      <Rect
        x={0.5}
        y={0.5}
        width={width - 1}
        height={height - 1}
        fill="none"
        stroke={colors.grid}
        strokeWidth={1}
      />

      <Path d={area} fill="url(#chart-wash)" />
      <Path
        d={line}
        fill="none"
        stroke={colors.gold}
        strokeWidth={2.6}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Crosshair on the cursor value. */}
      <Line x1={0} x2={width} y1={cy} y2={cy} stroke={colors.text} strokeWidth={1.4} strokeDasharray="7 6" />
      <Line x1={cx} x2={cx} y1={0} y2={height} stroke={colors.text} strokeWidth={1.4} strokeDasharray="7 6" />

      <Circle cx={cx} cy={cy} r={7.5} fill={colors.gold} stroke={colors.text} strokeWidth={1.6} />
    </Svg>
  )
}

/** Dark read-out pinned to the lower-left of the crosshair intersection. */
function Tooltip({
  open,
  close,
  left,
  top,
}: {
  open: number
  close: number
  left: number
  top: number
}) {
  return (
    <View style={[styles.tooltip, { left: left - TOOLTIP_WIDTH - 8, top: top + 108 }]}>
      <TooltipRow label="Open" value={open} direction="up" />
      <TooltipRow label="Close" value={close} direction="down" />
    </View>
  )
}

function TooltipRow({
  label,
  value,
  direction,
}: {
  label: string
  value: number
  direction: 'up' | 'down'
}) {
  return (
    <View style={styles.tooltipRow}>
      <Text style={styles.tooltipLabel}>{label}</Text>
      <DeltaTriangle direction={direction} color={colors.onInk} size={12} />
      <Text style={styles.tooltipValue}>{formatPrice(value, 2)}</Text>
    </View>
  )
}

const TOOLTIP_WIDTH = 158

function cursorX(width: number, length: number, index: number) {
  return (width / (length - 1)) * index
}

function cursorY(height: number, min: number, max: number, value: number) {
  return ((max - value) / (max - min)) * height
}

function buildTicks(min: number, max: number, step: number) {
  const ticks: number[] = []
  for (let value = max; value >= min; value -= step) ticks.push(value)
  return ticks
}

function range(count: number) {
  return Array.from({ length: count }, (_, index) => index)
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 18,
    borderRadius: 20,
  },
  plotRow: {
    flex: 1,
    flexDirection: 'row',
  },
  plot: {
    flex: 1,
  },
  axis: {
    width: AXIS_GUTTER,
  },
  axisLabel: {
    position: 'absolute',
    left: 12,
    fontSize: 15,
  },
  months: {
    flexDirection: 'row',
    height: MONTH_ROW,
    alignItems: 'center',
    paddingRight: AXIS_GUTTER,
  },
  month: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
  },
  tooltip: {
    position: 'absolute',
    width: TOOLTIP_WIDTH,
    backgroundColor: colors.inkRaised,
    borderRadius: 14,
    borderCurve: 'continuous',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 8,
    marginLeft: 18,
    marginTop: 18,
  },
  tooltipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tooltipLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.onInkMuted,
    width: 42,
  },
  tooltipValue: {
    flex: 1,
    textAlign: 'right',
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.onInk,
  },
})
