import type { ReactNode } from 'react'

export const SectionGeneraleImprimee = ({
  chiffresCles,
  graphiques,
}: {
  chiffresCles: ReactNode
  graphiques: ReactNode
}) => (
  <>
    <h2 className="fr-h3">Statistiques générales</h2>
    {chiffresCles}
    {graphiques}
  </>
)
