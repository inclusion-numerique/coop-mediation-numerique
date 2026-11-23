import {
  numberToPercentage,
  numberToString,
} from '@/libraries/nombre/formatNumber'
import { pluriel } from '@/libraries/pluriel'
import { typeActivitePluralLabels } from '../../../../ui/libelles/type-activite.labels'
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
          `, ${participations} sur ${pluriel(participations, 'participation', 'participations')} au total`}{' '}
        ({numberToPercentage(proportion)} des activités)
      </li>
    ))}
  </ul>
)
