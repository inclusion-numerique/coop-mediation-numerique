import PaginationNavWithPageSizeSelect from '@app/web/libs/data-table/PaginationNavWithPageSizeSelect'
import { generatePageSizeSelectOptions } from '@app/web/libs/data-table/pageSizeSelectOptions'
import type { ReactNode } from 'react'
import { LIGNES_PAR_PAGE } from '../../../../domain'
import { CarteDActivite } from '../../../../ui/carte/CarteDActivite'
import { CarteDeRendezVous } from '../../../../ui/carte/CarteDeRendezVous'
import { DetailDeLActiviteModale } from '../../../../ui/detail/DetailDeLActiviteModale'
import type { CarteDuJour } from '../mes-activites.presenter'

const optionsDeLignes = generatePageSizeSelectOptions([...LIGNES_PAR_PAGE])

export const HistoriqueDesAccompagnements = ({
  cartes,
  pages,
  adresse,
  parametres,
  saisieDuStatutDesRendezVous,
}: {
  cartes: readonly CarteDuJour[]
  pages: number
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
    <PaginationNavWithPageSizeSelect
      className="fr-mt-12v"
      totalPages={pages}
      baseHref={adresse}
      searchParams={parametres}
      defaultPageSize={50}
      pageSizeOptions={optionsDeLignes}
    />
    <DetailDeLActiviteModale />
    {saisieDuStatutDesRendezVous}
  </>
)
