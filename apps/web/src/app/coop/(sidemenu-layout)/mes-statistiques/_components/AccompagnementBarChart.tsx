'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts'

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) =>
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
  // Si plus de 12 éléments, on ne garde que les 30 dernières valeurs
  const displayData = data.length > 12 ? data.slice(-30) : data

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
          className="fr-text--xxs"
          tickFormatter={(value) =>
            value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString()
          }
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" fill="#6a6af4" radius={[4, 4, 0, 0]}>
          <LabelList
            dataKey="count"
            position="top"
            style={{
              fontSize: displayData.length > 12 ? 10 : 12,
              fontWeight: 'bold',
            }}
            formatter={(count: number) => {
              if (count === 0) return ''
              if (count >= 1000) {
                return `${(count / 1000).toFixed(1)}k`
              }
              return count.toString()
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
