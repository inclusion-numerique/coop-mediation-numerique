'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts'

const CustomTooltip = ({
  active,
  payload,
  label,
  // Génériques laissés par défaut : <Tooltip> les instancie en ValueType/NameType, et les
  // restreindre ici rendrait le composant incompatible avec la propriété `content`.
}: TooltipContentProps) =>
  active &&
  payload &&
  payload.length > 0 && (
    <div
      className="fr-p-2v fr-border-radius--8 fr-tile--shadow fr-whitespace-nowrap fr-text--sm"
      style={{ backgroundColor: 'rgba(30, 27, 57, 0.95)', color: 'white' }}
    >
      <div className="fr-text--bold">{label}</div>
      <div>
        <span className="fr-text--xs">Accompagnements&nbsp;:</span>{' '}
        <span className="fr-text--bold">
          {payload[0].value?.toLocaleString('fr-FR')}
        </span>
      </div>
    </div>
  )

export const AccompagnementBarChart = ({
  data,
}: {
  data: { label: string; count: number }[]
}) => {
  const isEmpty = data.length === 0 || data.every((item) => item.count === 0)
  const emptyData = data.map((item) => ({ ...item, count: 1 }))
  const displayData = isEmpty
    ? emptyData
    : data.length > 12
      ? data.slice(-30)
      : data

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={displayData}
        margin={{ top: 15, right: 10, left: 0, bottom: 0 }}
        barSize={displayData.length > 18 ? 16 : 20}
      >
        <CartesianGrid
          horizontal
          vertical={false}
          strokeDasharray="3 3"
          stroke="#ddd"
        />
        <XAxis
          className="fr-text--xxs"
          dataKey="label"
          scale="point"
          padding={{ left: 14, right: 14 }}
          tickLine={false}
          axisLine={false}
          interval={displayData.length > 12 ? 2 : 0}
        />
        <YAxis
          width={22}
          tickCount={5}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          domain={isEmpty ? [0, 1] : undefined}
          className="fr-text--xxs"
          tickFormatter={(value) =>
            isEmpty
              ? ''
              : value >= 1000
                ? `${(value / 1000).toFixed(1)}k`
                : value.toString()
          }
        />
        {!isEmpty && <Tooltip content={CustomTooltip} />}
        <Bar
          dataKey="count"
          fill={isEmpty ? 'var(--blue-france-975-75)' : '#6a6af4'}
          radius={[4, 4, 0, 0]}
        >
          {!isEmpty && (
            <LabelList
              dataKey="count"
              position="top"
              style={{
                fontSize: displayData.length > 12 ? 10 : 12,
                fontWeight: 'bold',
              }}
              // recharts 3 type le formateur de LabelList en `RenderableText`
              // (`string | number`) et non plus en `number` : on restreint ici.
              formatter={(label) => {
                const count = typeof label === 'number' ? label : Number(label)
                if (!count) return ''
                if (count >= 1000) {
                  return `${(count / 1000).toFixed(1)}k`
                }
                return count.toString()
              }}
            />
          )}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
