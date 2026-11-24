import type { ReactNode } from 'react'
import { CarteDActivite } from '../../../../ui/components/carte/CarteDActivite'
import { DetailDeLActiviteModale } from '../../../../ui/components/DetailDeLActiviteModale'
import { PaginationDesActivites } from '../../../../ui/components/PaginationDesActivites'
import {
  CarteDeRendezVous,
  type RenseignerLeStatut,
} from '../components/CarteDeRendezVous'
import type { CarteDuJour } from '../presenters/mes-activites.presenter'

export const HistoriqueDesAccompagnements = ({
  cartes,
  total,
  lignesParPage,
  adresse,
  parametres,
  saisieDuStatutDesRendezVous,
  renseignerLeStatut,
}: {
  cartes: readonly CarteDuJour[]
  total: number
  lignesParPage: number
  adresse: string
  parametres: Record<string, string>
  saisieDuStatutDesRendezVous: ReactNode
  renseignerLeStatut: RenseignerLeStatut
}) => (
  <>
    {cartes.map((carte) =>
      carte._tag === 'RendezVous' ? (
        <CarteDeRendezVous
          key={carte.carte.id}
          carte={carte.carte}
          renseignerLeStatut={renseignerLeStatut}
        />
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
