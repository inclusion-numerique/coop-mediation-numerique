'use client'

import Card from '@app/web/components/Card'
import type { LieuActivitePageDataMediateurEnActivite } from '@app/web/features/lieux-activite/getLieuActivitePageData'
import ActeurCard from '@app/web/features/mon-reseau/use-cases/acteurs/components/ActeurCard'
import Button from '@codegouvfr/react-dsfr/Button'
import { useState } from 'react'

const initialMediateurCount = 3

export const LieuMediateursEnActivite = ({
  mediateurs,
  departementCode,
  canRemoveMediateurFromLieuId,
  structureNom,
}: {
  mediateurs: LieuActivitePageDataMediateurEnActivite[]
  departementCode: string
  canRemoveMediateurFromLieuId: string | null // if null, mediateurs cannot be removed from the lieu
  structureNom: string
}) => {
  const [showMore, setShowMore] = useState(false)

  const mediateursToDisplay = showMore
    ? mediateurs
    : mediateurs.slice(0, initialMediateurCount)
  const showMoreButton = mediateurs.length > initialMediateurCount

  return (
    <Card
      noBorder
      className="fr-border fr-border-radius--8"
      titleAs="div"
      id="mediateurs"
      title={
        <span className="fr-flex fr-flex-gap-3v fr-align-items-center fr-mb-0">
          <span
            className="ri-account-circle-line fr-line-height-1 fr-text--medium fr-text-label--blue-france fr-background-alt--blue-france fr-p-2v fr-border-radius--8"
            aria-hidden
          />
          <h2 className="fr-text-title--blue-france fr-h6 fr-m-0">
            Médiateurs numériques référencés sur ce lieu · {mediateurs.length}
          </h2>
        </span>
      }
    >
      <hr className="fr-separator-1px" />
      <ul className="fr-list-group fr-my-0">
        {mediateursToDisplay.map((acteur) => (
          <ActeurCard
            key={acteur.id}
            acteur={acteur.mediateur.user}
            departementCode={departementCode}
            canRemoveMediateurFromLieuId={
              canRemoveMediateurFromLieuId ?? undefined
            }
            structureNom={structureNom}
            derniereActivite={acteur.mediateur.derniereActivite}
          />
        ))}
      </ul>
      {showMoreButton && (
        <div className="fr-pt-6v">
          <Button
            title="Afficher tous les médiateurs numériques référencés sur ce lieu"
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

export default LieuMediateursEnActivite
