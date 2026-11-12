'use client'

import { RDVServicePublicLogo } from '@app/web/features/pictograms/services/RDVServicePublicLogo'
import { inject } from '@app/web/libs/injection/client'
import Badge from '@codegouvfr/react-dsfr/Badge'
import Button from '@codegouvfr/react-dsfr/Button'
import ActiviteCardSpacer from './ActiviteCardSpacer'
import type { CarteDeRendezVous as Carte } from './carte-de-rendez-vous.presenter'
import ListCard from './ListCard'
import { OUVRIR_LA_SAISIE_DU_STATUT_DU_RDV_KEY } from './ouvrir-la-saisie-du-statut.key'

export const CarteDeRendezVous = ({ carte }: { carte: Carte }) => {
  const ouvrirLaSaisieDuStatut = inject(OUVRIR_LA_SAISIE_DU_STATUT_DU_RDV_KEY)()

  return (
    <ListCard
      pictogram={RDVServicePublicLogo}
      enlargeLink
      contentTop={
        <>
          Rendez-vous
          <ActiviteCardSpacer />
          <span className="fr-icon-time-line fr-icon--xs " />
          &nbsp;
          {carte.horaires}
        </>
      }
      contentBottom={carte.description}
      actions={
        <>
          <Badge small severity={carte.statut.severite} className="fr-mr-2v">
            {carte.statut.libelle}
          </Badge>
          {carte.aRenseigner ? (
            <Button
              priority="tertiary no outline"
              size="small"
              className="fr-flex-shrink-0"
              title="Renseigner le statut du RDV"
              onClick={() =>
                ouvrirLaSaisieDuStatut({
                  id: carte.id,
                  collectif: carte.collectif,
                })
              }
            >
              À renseigner
            </Button>
          ) : (
            <Button
              priority="tertiary no outline"
              size="small"
              className="fr-flex-shrink-0"
              title="Voir et modifier le RDV"
              linkProps={{ href: carte.lien, target: '_blank' }}
            >
              Voir
            </Button>
          )}
        </>
      }
    />
  )
}
