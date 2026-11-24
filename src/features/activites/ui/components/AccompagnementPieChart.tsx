'use client'

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
} from 'recharts'
import {
  numberToPercentage,
  numberToString,
} from '@/libraries/nombre/format-number'

type PieData = { label: string; count: number; proportion: number }

const CustomTooltip = ({
  active,
  payload,
}: TooltipProps<number, string> & {
  payload?: { payload: PieData }[]
}) => {
  const point = payload?.[0]?.payload
  return (
    active &&
    point !== undefined && (
      <div
        className="fr-p-2v fr-border-radius--8 fr-tile--shadow fr-whitespace-nowrap fr-text--sm"
        style={{ backgroundColor: 'rgba(30, 27, 57, 0.95)', color: 'white' }}
      >
        <div className="fr-text--bold">{point.label}</div>
        <div>
          <span className="fr-text--xs">Accompagnements&nbsp;:</span>{' '}
          <span className="fr-text--bold">{numberToString(point.count)}</span>
          &emsp;
          {numberToPercentage(point.proportion)}
        </div>
      </div>
    )
  )
}

export const AccompagnementPieChart = ({
  data,
  size,
  isAnimationActive = true,
  width = 24,
  colors = [],
  className,
  half = false,
}: {
  data: { label: string; count: number; proportion: number }[]
  size: number
  isAnimationActive?: boolean
  width?: number
  colors?: string[]
  className?: string
  half?: boolean
}) => {
  const isEmpty = data.length === 0 || data.every((item) => item.count === 0)
  const emptyData = [{ label: 'Aucune donnée', count: 1, proportion: 100 }]

  return (
    <ResponsiveContainer
      width={size}
      height={half ? size / 2 + 10 : size}
      {...(className === undefined ? {} : { className })}
    >
      <PieChart>
        <Pie
          strokeWidth={0}
          dataKey="count"
          nameKey="label"
          isAnimationActive={isAnimationActive}
          data={isEmpty ? emptyData : data}
          cx="50%"
          cy={half ? '100%' : '50%'}
          innerRadius={size / 2 - width}
          outerRadius={size / 2}
          startAngle={half ? 180 : 0}
          endAngle={half ? 0 : 360}
        >
          {isEmpty ? (
            <Cell fill="var(--blue-france-975-75)" />
          ) : (
            data.map((item, index) => {
              const fill = colors[index % colors.length]
              return (
                <Cell
                  key={item.label}
                  {...(fill === undefined ? {} : { fill })}
                />
              )
            })
          )}
        </Pie>
        {!isEmpty && <Tooltip content={<CustomTooltip />} />}
      </PieChart>
    </ResponsiveContainer>
  )
}
