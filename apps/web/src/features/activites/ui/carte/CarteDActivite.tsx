'use client'

import { TruncateText } from '@app/ui/components/Primitives/TruncatedText'
import { RDVServicePublicLogo } from '@app/web/features/pictograms/services/RDVServicePublicLogo'
import type { MouseEventHandler } from 'react'
import { DetailDeLActiviteDynamicModal } from '../detail/DetailDeLActiviteModale'
import { typeActivitePictograms } from '../libelles/type-activite'
import ActiviteCardSpacer from './ActiviteCardSpacer'
import type { CarteDActivite as Carte } from './carte-d-activite.presenter'
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

export const CarteDActivite = ({ carte }: { carte: Carte }) => (
  <ListCard
    enlargeButton
    pictogram={typeActivitePictograms[carte.type]}
    contentTop={
      <>
        {carte.libelleDuType}
        {carte.titreDAtelier !== null && (
          <>
            <ActiviteCardSpacer />
            <TruncateText text={carte.titreDAtelier} maxLength={40} />
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
