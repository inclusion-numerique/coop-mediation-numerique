'use client'

import Card from '@app/web/components/Card'
import LieuCard from '@app/web/features/mon-reseau/use-cases/lieux/components/LieuCard'
import type { LieuForList } from '@app/web/features/mon-reseau/use-cases/lieux/db/searchLieux'
import Button from '@codegouvfr/react-dsfr/Button'
import { useState } from 'react'

const initialLieuCount = 3

export const ActeurLieuxActivites = ({
  lieux,
  departementCode,
  lieuPageRetourHref,
}: {
  lieux: LieuForList[]
  departementCode: string | null
  lieuPageRetourHref: string
}) => {
  const [showMore, setShowMore] = useState(false)

  const lieuxToDisplay = showMore ? lieux : lieux.slice(0, initialLieuCount)
  const showMoreButton = lieux.length > initialLieuCount

  return (
    <Card
      noBorder
      className="fr-border fr-border-radius--8"
      titleAs="div"
      title={
        <span className="fr-flex fr-flex-gap-3v fr-align-items-end fr-mb-0">
          <span
            className="ri-home-office-line fr-line-height-1 fr-text--medium fr-text-label--blue-france fr-background-alt--blue-france fr-p-2v fr-border-radius--8"
            aria-hidden
          />
          <h2 className="fr-text-title--blue-france fr-h6 fr-m-0">
            Lieux d’activité · {lieux.length}
          </h2>
        </span>
      }
    >
      <ul className="fr-list-group">
        {lieuxToDisplay.map((lieu) => (
          <LieuCard
            key={lieu.id}
            lieu={lieu}
            departementCode={departementCode}
            lieuPageRetourHref={lieuPageRetourHref}
          />
        ))}
      </ul>
      {showMoreButton && (
        <div className="fr-border--top fr-pt-6v">
          <Button
            title="Afficher toutes les lieux d'activités"
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
