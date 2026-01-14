'use client'

import Card from '@app/web/components/Card'
import IconInSquare from '@app/web/components/IconInSquare'
import { getDepartementCodeForLieu } from '@app/web/features/mon-reseau/getDepartementCodeForLieu'
import LieuCard from '@app/web/features/mon-reseau/use-cases/lieux/components/LieuCard'
import type { LieuForList } from '@app/web/features/mon-reseau/use-cases/lieux/db/searchLieux'
import Button from '@codegouvfr/react-dsfr/Button'
import { useState } from 'react'

const initialLieuCount = 3

export const ActeurLieuxActivites = ({ lieux }: { lieux: LieuForList[] }) => {
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
          <LieuCard
            key={lieu.id}
            lieu={lieu}
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
