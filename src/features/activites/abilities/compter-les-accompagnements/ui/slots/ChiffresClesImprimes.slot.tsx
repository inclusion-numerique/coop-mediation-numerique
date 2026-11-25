import { pluriel } from '@/libraries/pluriel'
import type { TotauxPresentes } from '../presenters/totaux.presenter'

export const ChiffresClesImprimes = ({
  totalCounts,
}: {
  totalCounts: TotauxPresentes
}) => (
  <>
    <h3 className="fr-h5">Accompagnements et bénéficiaires</h3>
    <p>
      <strong>
        {totalCounts.beneficiaires.total}{' '}
        {pluriel(
          totalCounts.beneficiaires.total,
          'Bénéficiaire',
          'Bénéficiaires',
        )}
      </strong>{' '}
      {pluriel(totalCounts.beneficiaires.total, 'accompagné', 'accompagnés')}{' '}
      {totalCounts.beneficiaires.nouveaux > 0 && (
        <>
          , dont{' '}
          <strong>
            {totalCounts.beneficiaires.nouveaux}{' '}
            {totalCounts.beneficiaires.nouveaux === 1 ? 'nouveau' : 'nouveaux'}
          </strong>
        </>
      )}
      &nbsp;:{' '}
      <strong>
        {totalCounts.beneficiaires.suivis}{' '}
        {pluriel(
          totalCounts.beneficiaires.suivis,
          'bénéficiaire suivi',
          'bénéficiaires suivis',
        )}
      </strong>{' '}
      et{' '}
      <strong>
        {totalCounts.beneficiaires.anonymes}{' '}
        {pluriel(
          totalCounts.beneficiaires.anonymes,
          'bénéficiaire anonyme',
          'bénéficiaires anonymes',
        )}
      </strong>
    </p>
    <p>
      <strong>
        {totalCounts.accompagnements.total}{' '}
        {pluriel(
          totalCounts.accompagnements.total,
          'accompagnement',
          'accompagnements',
        )}
      </strong>{' '}
      au total
      <br />
      <small role="note" className="fr-mb-6v fr-display-block">
        *Les ateliers collectifs comptent pour 1 accompagnement par
        participation.
        <br />
        Ex : Un atelier collectif avec 10 participations compte pour 10
        accompagnements.
      </small>
    </p>
  </>
)
