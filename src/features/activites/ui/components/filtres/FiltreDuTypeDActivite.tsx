'use client'

import { ChoixEnPopover } from '@/libraries/etat-d-url/filtres/ChoixEnPopover'
import { RDVServicePublicLogo } from '@/libraries/pictograms/services/RDVServicePublicLogo'
import {
  filtreDuStatutDeRendezVous,
  filtreDuTypeDActivite,
} from '../../filtres/activites.filtre'

const LegendeDesRendezVous = () => (
  <span className="fr-flex fr-align-items-center fr-flex-gap-3v">
    <span
      className="fr-background-alt--blue-france fr-p-1-5v fr-border-radius--8 fr-flex"
      aria-hidden
    >
      <RDVServicePublicLogo
        className="fr-display-block"
        height={24}
        width={24}
      />
    </span>
    Rendez-vous via RDV&nbsp;Service&nbsp;Public
  </span>
)

export const FiltreDuTypeDActivite = ({
  rendezVousFiltrables,
}: {
  rendezVousFiltrables: boolean
}) => (
  <ChoixEnPopover
    titre="Type"
    sections={[
      { filtre: filtreDuTypeDActivite, legende: 'Filtrer par :' },
      ...(rendezVousFiltrables
        ? [
            {
              filtre: filtreDuStatutDeRendezVous,
              legende: <LegendeDesRendezVous />,
              petit: true,
            },
          ]
        : []),
    ]}
  />
)
