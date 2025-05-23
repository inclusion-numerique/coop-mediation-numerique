import React from 'react'
import { ChartCard, ChartCardDataProps } from '../ChartCard'

export const UtilisateursActifs = ({
  utilisateursActifs,
}: {
  utilisateursActifs: ChartCardDataProps
}) => (
  <>
    <h2 className="fr-h3 fr-mb-12v fr-flex fr-align-items-center fr-flex-gap-3v">
      <span className="ri-map-pin-user-fill fr-text--regular" />
      Impact sur nos utilisateurs : les médiateurs numériques
    </h2>
    <ChartCard
      title="Utilisateurs actifs"
      chartTitle="Évolution du nombre d’utilisateurs actifs"
      color="brown-caramel"
      icon="ri-account-circle-line"
      {...utilisateursActifs}
    />
  </>
)
