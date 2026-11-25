import Link from 'next/link'
import { routeConstruite } from '@/libraries/nextjs'
import { RDVServicePublicLogo } from '@/libraries/pictograms/services'
import { Spinner } from '@/libraries/ui/components'

const RdvsAccueilHeader = ({
  isLoading,
  href,
}: {
  isLoading: boolean
  href: string
}) => (
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
    <h2 className="fr-h6 fr-text-mention--grey fr-mb-0">RDV Service Public</h2>
    <span className="fr-flex-grow-1" />
    {isLoading && (
      <div className="fr-flex fr-align-items-center fr-flex-gap-2v">
        <Spinner
          className="fr-text-mention--grey fr-mb-0"
          size="small"
          inline
        />
        <span className="fr-text--xs fr-text-mention--grey fr-mb-0 fr-mr-4v">
          Synchronisation des rendez-vous
        </span>
      </div>
    )}
    <Link
      className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
      href={routeConstruite(href)}
    >
      Voir tous mes rendez-vous
    </Link>
  </div>
)

export default RdvsAccueilHeader
