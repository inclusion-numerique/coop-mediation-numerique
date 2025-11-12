import { RDVServicePublicLogo } from '@app/web/features/pictograms/services/RDVServicePublicLogo'
import { rdvStatusValues } from '@app/web/rdv-service-public/rdvStatus'
import { Spinner } from '@app/web/ui/Spinner'
import Link from 'next/link'

const RdvsHeader = ({ isLoading }: { isLoading: boolean }) => (
  <div className="fr-flex fr-flex-wrap fr-align-items-center fr-justify-content-space-between fr-mb-3w">
    <div
      className="fr-background-blue-france-alt-light--action-low-dark fr-p-1-5v fr-border-radius--8 fr-flex fr-mr-1w"
      aria-hidden
    >
      <RDVServicePublicLogo
        className="fr-display-block"
        width={28}
        height={28}
      />
    </div>
    <h2 className="fr-h5 fr-text-mention--grey fr-mb-0">RDV Service Public</h2>
    <span className="fr-flex-grow-1" />
    {isLoading && (
      <div>
        <Spinner size="small" inline />
        Synchronisation des rendez-vous
      </div>
    )}
    <Link
      className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
      href={`/coop/mes-activites?rdvs=${rdvStatusValues.join(',')}&voir-rdvs=1`}
    >
      Voir tous mes rendez-vous
    </Link>
  </div>
)

export default RdvsHeader
