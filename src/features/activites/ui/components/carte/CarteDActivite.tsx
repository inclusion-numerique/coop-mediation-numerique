'use client'

import type { MouseEventHandler } from 'react'
import { RDVServicePublicLogo } from '@/libraries/pictograms/services/RDVServicePublicLogo'
import { TruncateText } from '@/libraries/ui/components/primitives/TruncatedText'
import { typeActivitePictograms } from '../../labels/libelles/type-activite.labels'
import type { CarteDActivite as Carte } from '../../presenters/carte-d-activite.presenter'
import { DetailDeLActiviteDynamicModal } from '../DetailDeLActiviteModale'
import ActiviteCardSpacer from './ActiviteCardSpacer'
import ListCard from './ListCard'

const OuvrirLeDetail = ({ carte }: { carte: Carte }) => {
  const ouvrir = DetailDeLActiviteDynamicModal.useOpen()
  const onClick: MouseEventHandler = (event) => {
    ouvrir(carte.detail)
    event.preventDefault()
    event.stopPropagation()
  }
  return <button type="button" title="Voir le détail" onClick={onClick} />
}

export type PlaceDansLaPile = {
  readonly premiere: boolean
  readonly derniere: boolean
}

export const CarteDActivite = ({
  carte,
  jour,
  pile,
}: {
  carte: Carte
  jour?: string
  pile?: PlaceDansLaPile
}) => (
  <ListCard
    enlargeButton
    pictogram={typeActivitePictograms[carte.type]}
    stacked={pile !== undefined}
    firstOfStack={pile?.premiere}
    lastOfStack={pile?.derniere}
    contentTop={
      <>
        {carte.libelleDuType}
        {carte.titreDAtelier !== null && (
          <>
            <ActiviteCardSpacer />
            <TruncateText text={carte.titreDAtelier} maxLength={40} />
          </>
        )}
        {jour !== undefined && (
          <>
            <ActiviteCardSpacer />
            le {jour}
          </>
        )}
        <ActiviteCardSpacer />
        <span className="fr-icon-time-line fr-icon--xs" />
        &nbsp;
        {carte.duree}
      </>
    }
    contentBottom={
      <div className="fr-text--medium">
        {carte.thematiques.map((thematique, rang) => (
          <span key={thematique}>
            {rang > 0 && <ActiviteCardSpacer />}
            {thematique}
          </span>
        ))}
        {carte.autresThematiques > 0 && (
          <>
            <ActiviteCardSpacer />+{carte.autresThematiques}
          </>
        )}
      </div>
    }
    actions={
      <>
        {carte.personnes._tag === 'Participants' ? (
          <>
            <span className="fr-icon-group-line fr-mr-1w fr-icon--sm" />
            {carte.personnes.texte}
          </>
        ) : (
          <>
            <span className="fr-icon-user-line fr-mr-1w fr-icon--sm" />
            <TruncateText
              className="fr-text--nowrap"
              text={carte.personnes.nom}
              maxLength={20}
            />
          </>
        )}
        <OuvrirLeDetail carte={carte} />
      </>
    }
    footer={
      carte.issueDUnRendezVous ? (
        <div className="fr-text--xs fr-text-mention--grey fr-mb-0 fr-flex fr-align-items-center fr-mt-2v">
          <div
            className="fr-background-alt--blue-france fr-p-1v fr-border-radius--4 fr-flex fr-mr-1-5v"
            aria-hidden
          >
            <RDVServicePublicLogo
              className="fr-display-block"
              width={14}
              height={14}
            />
          </div>
          RDV pris via RDV&nbsp;Service&nbsp;Public
        </div>
      ) : null
    }
  />
)
