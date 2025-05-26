import React from 'react'
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
      <h2 className="fr-h3">
        Chiffres clés pour suivre l’usage de la plateforme
      </h2>
      <div className="fr-grid-row fr-grid-row--gutters fr-mb-9v fr-align-items-stretch">
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
