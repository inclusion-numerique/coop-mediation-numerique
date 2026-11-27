'use client'

import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl'
import { useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { numberToString } from '@/libraries/nombre'
import CustomTooltip from './CustomTooltip'

export type LegendeDesStatistiques<T extends object = object> = {
  label: string
  value?: string
  key: keyof T
}

export type ChartSerie = {
  label: string
  description?: string
  value: number
  percentage: number
  key: string
}

export type DonneesDuGraphique =
  | {
      mois: string
    }
  | { [key: string]: number }

const valeurDe = (ligne: object, cle: PropertyKey): unknown =>
  Object.entries(ligne).find(([nom]) => nom === String(cle))?.[1]

const StatisticsTooltip = <T extends object>({
  tooltipLabelDataKey,
  legends = [],
}: {
  tooltipLabelDataKey?: keyof T
  legends?: LegendeDesStatistiques<T>[]
}) => (
  <Tooltip
    wrapperClassName="fr-text--sm fr-text-default--grey "
    isAnimationActive={false}
    content={CustomTooltip}
    cursor={{ fill: 'var(--background-alt-blue-france)' }}
    labelFormatter={(label, payload) => {
      const labelAsString = `${label}`
      if (!tooltipLabelDataKey) return labelAsString

      const ligne: unknown = payload[0]?.payload
      if (typeof ligne !== 'object' || ligne === null) return labelAsString

      return `${valeurDe(ligne, tooltipLabelDataKey)}` || null
    }}
    formatter={(_value, name) =>
      legends.find((legend) => legend.key === name)?.label
    }
  />
)

const nextTitleMap = new Map<
  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div',
  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
>([
  ['h1', 'h2'],
  ['h2', 'h3'],
  ['h3', 'h4'],
  ['h4', 'h5'],
  ['h5', 'h6'],
])

export const MonthChart = ({
  title,
  nextForTitleAs,
  chartColors,
  series,
  counts,
  runningTotal,
}: {
  title: string
  nextForTitleAs: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
  chartColors: { fill: string }[]
  series: ChartSerie[]
  counts: DonneesDuGraphique[]
  runningTotal?: DonneesDuGraphique[] | undefined
}) => {
  const [isCumulative, setIsCumulative] = useState(false)

  const dataKeys = series.map(({ key }) => key)

  const xAxisDataKey = 'mois'

  const tooltipLabelDataKey = 'mois'

  const ChartTitle = nextTitleMap.get(nextForTitleAs) ?? 'div'

  const legends = series.map(({ label, key }) => ({
    label,
    key,
  }))

  return (
    <>
      <div className="fr-grid-row fr-mb-8v fr-align-items-center">
        <ChartTitle className="fr-h6 fr-col-12 fr-col-lg fr-mb-4v fr-mb-md-0">
          {title}
        </ChartTitle>
        {runningTotal != null && (
          <SegmentedControl
            className="fr-col-12 fr-col-lg-auto"
            hideLegend
            small
            legend="Bascule entre entre les périodes"
            segments={[
              {
                label: 'Par mois',
                nativeInputProps: {
                  checked: !isCumulative,
                  onChange: () => setIsCumulative(false),
                },
              },
              {
                label: 'En cumulé',
                nativeInputProps: {
                  checked: isCumulative,
                  onChange: () => setIsCumulative(true),
                },
              },
            ]}
          />
        )}
      </div>
      <div style={{ height: 240, marginLeft: -32 }}>
        <ResponsiveContainer width="100%" height="100%">
          {isCumulative ? (
            <AreaChart
              {...(runningTotal === undefined ? {} : { data: runningTotal })}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              {StatisticsTooltip({ tooltipLabelDataKey, legends })}
              <XAxis
                dataKey={xAxisDataKey.toString()}
                interval={0}
                fontSize={10}
              />
              <YAxis
                width={54}
                fontSize={10}
                tickFormatter={numberToString}
                allowDecimals={false}
              />
              {dataKeys.map((dataKey, index) => (
                <Area
                  key={dataKey.toString()}
                  stackId="stack-0"
                  dataKey={dataKey.toString()}
                  fill={chartColors[index]?.fill}
                />
              ))}
            </AreaChart>
          ) : (
            <BarChart data={counts}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              {StatisticsTooltip({ tooltipLabelDataKey, legends })}
              <XAxis
                dataKey={xAxisDataKey.toString()}
                interval={0}
                fontSize={10}
              />
              <YAxis
                width={54}
                fontSize={10}
                tickFormatter={numberToString}
                allowDecimals={false}
              />
              {dataKeys.map((dataKey, index) => (
                <Bar
                  key={dataKey.toString()}
                  stackId="stack-0"
                  barSize={35}
                  dataKey={dataKey.toString()}
                  fill={chartColors[index]?.fill}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </>
  )
}
