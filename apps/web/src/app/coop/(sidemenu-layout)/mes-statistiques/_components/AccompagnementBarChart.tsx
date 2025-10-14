'use client'

import {
  Bar,
  BarChart,
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
    <ul className="fr-background-default--grey fr-p-1w fr-list-group fr-raw-list fr-tile--shadow">
      <li className="fr-text--bold">{label}</li>
      <li>
        Accompagnements :{' '}
        <span className="fr-text--bold">
          {payload[0].value?.toLocaleString('fr-FR')}
        </span>
      </li>
    </ul>
  )

export const AccompagnementBarChart = ({
  data,
}: {
  data: { label: string; count: number }[]
}) => {
  // Si plus de 12 éléments, on ne garde que les 30 dernières valeurs
  const displayData = data.length > 12 ? data.slice(-30) : data

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={displayData}
        margin={{ top: 15, right: 30, left: 20, bottom: 10 }}
        barSize={displayData.length > 12 ? 6 : 16}
      >
      <XAxis
        className="fr-text--sm fr-text--medium"
        dataKey="label"
        scale="point"
        tick={{ dy: 10 }}
        padding={{ left: 10, right: 10 }}
        tickLine={false}
        angle={-45}
        interval={displayData.length > 12 ? 2 : 0}
      />
      <YAxis
        className="fr-text--sm fr-text--medium"
        tickMargin={15}
        allowDecimals={false}
        interval="preserveStartEnd"
        tickFormatter={(value) => {
          if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}k`
          }
          return value.toString()
        }}
      />
      <Tooltip content={<CustomTooltip />} />
      <Bar dataKey="count" fill="#009099" radius={[10, 10, 0, 0]}>
        <LabelList
          dataKey="count"
          position="top"
          style={{ 
            fontSize: displayData.length > 12 ? 10 : 12, 
            fontWeight: 'bold' 
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
