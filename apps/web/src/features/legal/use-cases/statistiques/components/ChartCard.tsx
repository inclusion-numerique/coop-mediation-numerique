import IconInSquare from '@app/web/components/IconInSquare'
import { numberToString } from '@app/web/utils/formatNumber'
import type { ButtonProps } from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import React from 'react'
import {
  datesDonneesRecolteesEtMisesAJour,
  totalDepuis,
} from '../../wording/statistiquesPubliquesWording'
import { LegendTile } from './LegendTile'
import { ChartData, ChartSerie, MonthChart } from './MonthChart'

const chartColors = [
  { fill: 'var(--blue-france-sun-113-625)' },
  { fill: 'var(--blue-ecume-925-125-active)' },
  { fill: 'var(--blue-cumulus-925-125)' },
]

export type ChartCardUIProps = {
  title: string
  chartTitle: string
  titleAs?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
  legend?: string
  icon: ButtonProps.IconOnly['iconId']
  color: 'blue-france' | 'brown-caramel'
}

export type ChartCardDataProps = {
  series: ChartSerie[]
  perMonth: ChartData[]
  runningTotalPerMonth?: ChartData[]
  total: number
}

export type ChartCardProps = ChartCardUIProps & ChartCardDataProps

export const ChartCard = ({
  title,
  chartTitle,
  titleAs: CardTitle = 'h3',
  legend,
  icon,
  total,
  color,
  series,
  perMonth,
  runningTotalPerMonth,
}: ChartCardProps) => (
  <div
    className={classNames(
      'fr-border-radius--8 fr-p-8v fr-p-md-12v',
      `fr-background-alt--${color}`,
    )}
  >
    <div className="fr-text-default--grey fr-mb-8v fr-grid-row">
      <span className="fr-col-12 fr-col-lg fr-inline-flex fr-align-items-center fr-flex-gap-6v">
        <IconInSquare
          iconId={icon}
          classes={{ icon: color ? `fr-text-label--${color}` : undefined }}
          background="fr-background-default--grey"
        />
        <span>
          <CardTitle className="fr-mb-1v">{title}</CardTitle>
          <p className="fr-text--xs fr-text-mention--grey fr-mb-0">
            {datesDonneesRecolteesEtMisesAJour()}
          </p>
        </span>
      </span>
      <span className="fr-col-12 fr-col-lg-auto fr-text--right">
        <span className="fr-h3 fr-mb-1v">{numberToString(total)}</span>
        <p className="fr-text--xs fr-text-mention--grey fr-mb-0">
          {totalDepuis()}
        </p>
      </span>
    </div>
    {legend && <p className="fr-mb-8v">{legend}</p>}
    <div className="fr-border-radius--8 fr-p-8v fr-background-default--grey">
      <MonthChart
        title={chartTitle}
        nextForTitleAs={CardTitle}
        chartColors={chartColors}
        counts={perMonth}
        runningTotal={runningTotalPerMonth}
        series={series}
      />
    </div>
    <div className="fr-flex fr-flex-gap-6v fr-mt-6v fr-direction-column fr-direction-lg-row">
      {series.map(({ key, label, description, value, percentage }, index) => (
        <LegendTile
          key={key}
          className="fr-flex-grow-1"
          value={value}
          percent={percentage}
          label={label}
          description={description}
          legendColor={chartColors[index].fill}
        />
      ))}
    </div>
  </div>
)
