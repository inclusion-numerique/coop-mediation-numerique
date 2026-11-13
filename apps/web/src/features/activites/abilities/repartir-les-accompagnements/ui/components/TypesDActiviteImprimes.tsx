import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import { numberToPercentage, numberToString } from '@app/web/utils/formatNumber'
import { typeActivitePluralLabels } from '../../../../ui/libelles/type-activite'
import type { RepartitionPresentee } from '../repartition.presenter'

export const TypesDActiviteImprimes = ({
  typeActivites,
  participations,
}: {
  typeActivites: RepartitionPresentee['typeActivites']
  participations: number
}) => (
  <ul>
    {typeActivites.map(({ count, proportion, value }) => (
      <li key={value}>
        <b>{numberToString(count)}</b> {typeActivitePluralLabels[value]}
        {value === 'Collectif' &&
          `, ${participations} sur participation${sPluriel(
            participations,
          )} au total`}{' '}
        ({numberToPercentage(proportion)} des activités)
      </li>
    ))}
  </ul>
)
