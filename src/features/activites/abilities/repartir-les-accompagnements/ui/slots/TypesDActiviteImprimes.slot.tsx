import {
  numberToPercentage,
  numberToString,
} from '@/libraries/nombre/format-number'
import { pluriel } from '@/libraries/pluriel'
import { typeActivitePluralLabels } from '../../../../ui/labels/libelles/type-activite.labels'
import type { RepartitionPresentee } from '../presenters/repartition.presenter'

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
