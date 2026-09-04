'use client'

import Card from '@app/web/components/Card'
import IconInSquare from '@app/web/components/IconInSquare'
import { LieuActiviteCard } from '@app/web/features/lieux-activite/ui'
import { getLieuHref } from '@app/web/features/mon-reseau/getLieuHref'
import { getActeurDisplayName } from '@app/web/features/mon-reseau/use-cases/acteurs/getActeurDisplayName'
import type { LieuAffiche } from '@app/web/features/mon-reseau/use-cases/lieux/contrat'
import Button from '@codegouvfr/react-dsfr/Button'
import { useState } from 'react'

const initialLieuCount = 3

export const ActeurLieuxActivites = ({
  lieux,
}: {
  lieux: readonly LieuAffiche[]
}) => {
  const [showMore, setShowMore] = useState(false)

  const lieuxToDisplay = showMore ? lieux : lieux.slice(0, initialLieuCount)
  const showMoreButton = lieux.length > initialLieuCount
  const hideLastLieuBorderBottom = !showMoreButton

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
        {lieuxToDisplay.map((lieu, index) => (
          <LieuActiviteCard
            key={lieu.id}
            lieu={lieu}
            href={getLieuHref(lieu)}
            derniereModificationPar={
              lieu.derniereModificationPar
                ? getActeurDisplayName(lieu.derniereModificationPar)
                : null
            }
            className={
              hideLastLieuBorderBottom && index === lieuxToDisplay.length - 1
                ? 'fr-border-none'
                : undefined
            }
          />
        ))}
      </ul>
      {showMoreButton && (
        <div className="fr-pt-6v">
          <Button
            title="Afficher tous les lieux d'activités"
            priority="tertiary no outline"
            iconId={
              showMore ? 'fr-icon-arrow-up-s-line' : 'fr-icon-arrow-down-s-line'
            }
            iconPosition="right"
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? 'Voir moins' : 'Voir tous'}
          </Button>
        </div>
      )}
    </Card>
  )
}

export default ActeurLieuxActivites
