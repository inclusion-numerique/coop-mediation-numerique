import type { ReactNode } from 'react'

export const SectionBeneficiairesImprimee = ({
  profil,
  communes,
}: {
  profil: ReactNode
  communes: ReactNode
}) => (
  <>
    <h2 className="fr-h3">Statistiques sur vos bénéficiaires</h2>
    {profil}
    {communes}
  </>
)
