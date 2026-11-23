import type { ReactNode } from 'react'
import { CarteDActivite } from '../../../../ui/components/carte/CarteDActivite'
import { CarteDeRendezVous } from '../../../../ui/components/carte/CarteDeRendezVous'
import { DetailDeLActiviteModale } from '../../../../ui/components/detail/DetailDeLActiviteModale'
import { PaginationDesActivites } from '../../../../ui/components/PaginationDesActivites'
import type { CarteDuJour } from '../presenters/mes-activites.presenter'

export const HistoriqueDesAccompagnements = ({
  cartes,
  total,
  lignesParPage,
  adresse,
  parametres,
  saisieDuStatutDesRendezVous,
}: {
  cartes: readonly CarteDuJour[]
  total: number
  lignesParPage: number
  adresse: string
  parametres: Record<string, string>
  saisieDuStatutDesRendezVous: ReactNode
}) => (
  <>
    {cartes.map((carte) =>
      carte._tag === 'RendezVous' ? (
        <CarteDeRendezVous key={carte.carte.id} carte={carte.carte} />
      ) : (
        <CarteDActivite key={carte.carte.id} carte={carte.carte} />
      ),
    )}
    <PaginationDesActivites
      className="fr-mt-12v"
      adresse={adresse}
      parametres={parametres}
      total={total}
      lignesParPage={lignesParPage}
    />
    <DetailDeLActiviteModale />
    {saisieDuStatutDesRendezVous}
  </>
)
