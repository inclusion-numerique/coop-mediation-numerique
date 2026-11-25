import Badge from '@codegouvfr/react-dsfr/Badge'
import Button from '@codegouvfr/react-dsfr/Button'
import type { ReactNode } from 'react'
import { RDVServicePublicLogo } from '@/libraries/pictograms/services'
import ActiviteCardSpacer from '../../../../ui/components/carte/ActiviteCardSpacer'
import ListCard from '../../../../ui/components/carte/ListCard'
import type { CarteDeRendezVous as Carte } from '../presenters/carte-de-rendez-vous.presenter'

export type RenseignerLeStatut = (rendezVous: {
  readonly id: number
  readonly collectif: boolean
}) => ReactNode

export const CarteDeRendezVous = ({
  carte,
  renseignerLeStatut,
}: {
  carte: Carte
  renseignerLeStatut: RenseignerLeStatut
}) => {
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
            renseignerLeStatut({ id: carte.id, collectif: carte.collectif })
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
