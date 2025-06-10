import Button from '@codegouvfr/react-dsfr/Button'
import React from 'react'
import { datesDonneesRecolteesEtMisesAJour } from '../../../wording/statistiquesPubliquesWording'
import { StatTile } from '../StatTile'

export const ChiffresCles = ({
  mediateurs,
  conseillers,
  coordinateurs,
}: {
  mediateurs: { total: number; value: number }
  conseillers: { total: number; value: number }
  coordinateurs: { total: number; value: number }
}) => {
  return (
    <>
      <div className="fr-flex fr-align-items-center fr-flex-gap-4v">
        <h2 className="fr-h3 fr-mb-0">
          Chiffres clés pour suivre l’usage de la plateforme
        </h2>
        <Button
          title="Plus d’information à propos des thématiques d’accompagnements"
          priority="tertiary no outline"
          size="small"
          type="button"
          aria-describedby="tooltip-thematiques-accompagnement"
        >
          <span className="ri-information-line fr-text--lg" aria-hidden />
        </Button>
        <span
          className="fr-tooltip fr-placement"
          id="tooltip-thematiques-accompagnement"
          role="tooltip"
          aria-hidden
        >
          Un médiateur et/ou conseiller numérique est considéré actif lorsqu’il
          a renseigné au moins un compte-rendu d’activité sur les 30 derniers
          jours.
          <br />
          Un coordinateur est considéré actif lorsqu’il c’est connecté au moins
          1 fois sur les 30 derniers jours.
        </span>
        <span className="fr-flex-grow-1" />
        <p className="fr-text--xs fr-text-mention--grey fr-mb-0">
          {datesDonneesRecolteesEtMisesAJour()}
        </p>
      </div>
      <div className="fr-mt-6v fr-grid-row fr-grid-row--gutters fr-mb-9v fr-align-items-stretch">
        <div className="fr-col-12 fr-col-lg-4">
          <StatTile
            variant="icon"
            {...mediateurs}
            label="Médiateurs numériques actifs"
            description={`sur ${mediateurs.total} profils de médiateurs numériques créés`}
            iconId="ri-account-circle-line"
          />
        </div>
        <div className="fr-col-12 fr-col-lg-4">
          <StatTile
            variant="image"
            {...conseillers}
            label="Conseillers numériques actifs"
            description={`sur ${conseillers.total} profils de conseillers numériques créés`}
            src="/images/services/conseillers-numerique-icon.svg"
          />
        </div>
        <div className="fr-col-12 fr-col-lg-4">
          <StatTile
            variant="icon"
            {...coordinateurs}
            label="Coordinateurs actifs"
            description={`sur ${coordinateurs.total} profils de coordinateurs créés`}
            iconId="ri-group-2-line"
          />
        </div>
      </div>
    </>
  )
}
