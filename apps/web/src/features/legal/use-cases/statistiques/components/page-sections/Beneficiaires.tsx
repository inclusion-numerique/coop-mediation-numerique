import { numberToString } from '@app/web/utils/formatNumber'
import React from 'react'
import { ChartCard, ChartCardDataProps } from '../ChartCard'
import { StatTile } from '../StatTile'

export const Beneficiaires = ({
  beneficiaires,
  moyenneAccompagnements,
  mediateursAvecBeneficiaires,
}: {
  beneficiaires: ChartCardDataProps
  moyenneAccompagnements: { total: number; value: number }
  mediateursAvecBeneficiaires: {
    total: number
    value: number
    percentage: number
  }
}) => (
  <>
    <h2 className="fr-h3 fr-mb-12v fr-flex fr-align-items-center fr-flex-gap-3v">
      <span className="ri-award-fill fr-text--regular" />
      Notre étoile du nord : l'impact sur les bénéficiaires
    </h2>
    <ChartCard
      title="Bénéficiaires accompagnés"
      chartTitle="Évolution du nombre de bénéficiaires accompagnés"
      color="blue-france"
      icon="ri-user-heart-line"
      showCumulativeToggle={false}
      {...beneficiaires}
    />
    <div className="fr-grid-row fr-grid-row--gutters fr-mt-8v fr-align-items-stretch">
      <div className="fr-col-12 fr-col-lg-6">
        <StatTile
          variant="icon"
          value={moyenneAccompagnements.value}
          label="Nombre d'accompagnements réalisés en moyenne par bénéficiaire suivis"
          description={`sur ${numberToString(
            moyenneAccompagnements.total,
          )} bénéficiaires suivis`}
          iconId="ri-user-search-line"
        />
      </div>
      <div className="fr-col-12 fr-col-lg-6">
        <StatTile
          variant="icon"
          {...mediateursAvecBeneficiaires}
          label="Nombre de médiateurs numériques (dont conseillers numériques) suivant des bénéficiaires"
          description={`sur ${numberToString(
            mediateursAvecBeneficiaires.total,
          )} médiateurs numériques (dont conseillers numériques)`}
          iconId="ri-user-follow-line"
        />
      </div>
    </div>
  </>
)
