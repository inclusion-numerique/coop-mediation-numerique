import type { ReactNode } from 'react'

export const StatistiquesNationalesPage = ({
  barreDeFiltres,
  generale,
  activites,
  beneficiaires,
}: {
  barreDeFiltres: ReactNode
  generale: ReactNode
  activites: ReactNode
  beneficiaires: ReactNode
}) => (
  <>
    {barreDeFiltres}
    <section className="fr-mb-6w">{generale}</section>
    <section className="fr-mb-6w">{activites}</section>
    <section className="fr-mb-6w">{beneficiaires}</section>
  </>
)
