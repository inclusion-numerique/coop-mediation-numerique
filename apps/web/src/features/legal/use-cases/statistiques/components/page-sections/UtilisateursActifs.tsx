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
      Impact sur nos utilisateurs&nbsp;: les médiateurs numériques
    </h2>
    <ChartCard
      title="Utilisateurs actifs"
      chartTitle="Évolution du nombre d’utilisateurs actifs"
      legend="Un médiateur et/ou conseiller numérique est considéré actif lorsqu’il a renseigné au moins un compte-rendu d’activité sur les 30 derniers jours. Un coordinateur est considéré actif lorsqu’il c’est connecté au moins 1 fois sur les 30 derniers jours."
      color="brown-caramel"
      icon="ri-account-circle-line"
      {...utilisateursActifs}
    />
  </>
)
