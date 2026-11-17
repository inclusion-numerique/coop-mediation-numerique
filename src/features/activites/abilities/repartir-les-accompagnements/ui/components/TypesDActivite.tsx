import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import { numberToString } from '@app/web/utils/formatNumber'
import type { RepartitionPresentee } from '../repartition.presenter'
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
            atelier
            {sPluriel(ateliers)}
          </span>
        )}
      </StatistiqueAccompagnement>
    ))}
  </>
)
