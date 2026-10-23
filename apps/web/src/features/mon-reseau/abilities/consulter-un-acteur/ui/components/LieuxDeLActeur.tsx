'use client'

import Card from '@app/web/components/Card'
import IconInSquare from '@app/web/components/IconInSquare'
import {
  hrefDuLieu,
  LieuActiviteCard,
} from '@app/web/features/lieux-activite/ui'
import Button from '@codegouvfr/react-dsfr/Button'
import { useState } from 'react'
import {
  auteurDeLaDerniereModification,
  type LieuAffiche,
} from '../../../../ui/lieu-affiche'

const NOMBRE_AFFICHE_AU_DEPART = 3

export const LieuxDeLActeur = ({
  lieux,
}: {
  lieux: readonly LieuAffiche[]
}) => {
  const [tousAffiches, afficherTous] = useState(false)

  const affiches = tousAffiches
    ? lieux
    : lieux.slice(0, NOMBRE_AFFICHE_AU_DEPART)
  const plusQueLeDepart = lieux.length > NOMBRE_AFFICHE_AU_DEPART

  return (
    <Card
      noBorder
      className="fr-border fr-border-radius--8"
      titleAs="div"
      title={
        <span className="fr-flex fr-flex-gap-3v fr-align-items-center fr-mb-0">
          <IconInSquare iconId="ri-home-office-line" size="small" />
          <h2 className="fr-text-title--blue-france fr-h6 fr-m-0">
            Lieux d’activité · {lieux.length}
          </h2>
        </span>
      }
    >
      <hr className="fr-separator-1px" />
      <ul className="fr-list-group fr-my-0">
        {affiches.map((lieu, rang) => (
          <LieuActiviteCard
            key={lieu.id}
            lieu={lieu}
            href={hrefDuLieu(lieu)}
            derniereModificationPar={auteurDeLaDerniereModification(lieu)}
            className={
              !plusQueLeDepart && rang === affiches.length - 1
                ? 'fr-border-none'
                : undefined
            }
          />
        ))}
      </ul>
      {plusQueLeDepart && (
        <div className="fr-pt-6v">
          <Button
            title="Afficher tous les lieux d'activités"
            priority="tertiary no outline"
            iconId={
              tousAffiches
                ? 'fr-icon-arrow-up-s-line'
                : 'fr-icon-arrow-down-s-line'
            }
            iconPosition="right"
            onClick={() => afficherTous(!tousAffiches)}
          >
            {tousAffiches ? 'Voir moins' : 'Voir tous'}
          </Button>
        </div>
      )}
    </Card>
  )
}
