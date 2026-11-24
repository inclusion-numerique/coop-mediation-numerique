import { numberToString } from '@/libraries/nombre/format-number'
import { pluriel } from '@/libraries/pluriel'
import type { RepartitionPresentee } from '../presenters/repartition.presenter'
import { StatistiqueAccompagnement } from './StatistiqueAccompagnement'

export const TypesDActivite = ({
  typeActivites,
  ateliers,
}: {
  typeActivites: RepartitionPresentee['typeActivites']
  ateliers: number
}) => (
  <>
    {typeActivites.map(({ count, proportion, value }) => (
      <StatistiqueAccompagnement
        key={value}
        className="fr-col-xl fr-col-12"
        typeActivite={value}
        count={count}
        proportion={proportion}
      >
        {value === 'Collectif' && (
          <span className="fr-text-mention--grey fr-text--sm fr-mb-0">
            &nbsp;·&nbsp;sur{' '}
            <span className="fr-text--bold">{numberToString(ateliers)}</span>{' '}
            {pluriel(ateliers, 'atelier', 'ateliers')}
          </span>
        )}
      </StatistiqueAccompagnement>
    ))}
  </>
)
