import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import type { TotauxPresentes } from '../totaux.presenter'

export const ChiffresClesImprimes = ({
  totalCounts,
}: {
  totalCounts: TotauxPresentes
}) => (
  <>
    <h3 className="fr-h5">Accompagnements et bénéficiaires</h3>
    <p>
      <strong>
        {totalCounts.beneficiaires.total} Bénéficiaire
        {sPluriel(totalCounts.beneficiaires.total)}
      </strong>{' '}
      accompagné{sPluriel(totalCounts.beneficiaires.total)}{' '}
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
        {totalCounts.beneficiaires.suivis} bénéficiaire
        {sPluriel(totalCounts.beneficiaires.suivis)} suivi
        {sPluriel(totalCounts.beneficiaires.suivis)}
      </strong>{' '}
      et{' '}
      <strong>
        {totalCounts.beneficiaires.anonymes} bénéficiaire
        {sPluriel(totalCounts.beneficiaires.anonymes)} anonyme
        {sPluriel(totalCounts.beneficiaires.anonymes)}
      </strong>
    </p>
    <p>
      <strong>
        {totalCounts.accompagnements.total} accompagnement
        {sPluriel(totalCounts.accompagnements.total)}
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
