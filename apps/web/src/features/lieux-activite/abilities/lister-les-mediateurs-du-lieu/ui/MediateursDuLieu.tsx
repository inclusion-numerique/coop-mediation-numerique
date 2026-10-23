'use client'

import Card from '@app/web/components/Card'
import Button from '@codegouvfr/react-dsfr/Button'
import { type ReactNode, useState } from 'react'
import type { MediateurDuLieu } from '../domain'
import { CarteDuMediateur } from './CarteDuMediateur'

const NOMBRE_AFFICHE_AU_DEPART = 3

export const MediateursDuLieu = ({
  mediateurs,
  departement,
  retraits,
}: {
  mediateurs: readonly MediateurDuLieu[]
  departement: string
  retraits?: Readonly<Record<string, ReactNode>>
}) => {
  const [tousAffiches, afficherTous] = useState(false)

  const affiches = tousAffiches
    ? mediateurs
    : mediateurs.slice(0, NOMBRE_AFFICHE_AU_DEPART)

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
      {mediateurs.length > 0 && (
        <>
          <hr className="fr-separator-1px" />
          <ul className="fr-list-group fr-my-0">
            {affiches.map((mediateur) => (
              <CarteDuMediateur
                key={mediateur.rattachementId}
                mediateur={mediateur}
                departement={departement}
                retrait={retraits?.[mediateur.rattachementId]}
              />
            ))}
          </ul>
        </>
      )}
      {mediateurs.length > NOMBRE_AFFICHE_AU_DEPART && (
        <div className="fr-pt-6v">
          <Button
            title="Afficher tous les médiateurs numériques référencés sur ce lieu"
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
