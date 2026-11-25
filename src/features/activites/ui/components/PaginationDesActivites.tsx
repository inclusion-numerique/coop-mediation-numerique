import { PiedDeListe } from '@/libraries/etat-d-url/liste'
import {
  listeDesActivites,
  paginationDesActivites,
} from '../filtres/liste-des-activites.filtre'

export const PaginationDesActivites = ({
  adresse,
  parametres,
  total,
  lignesParPage,
  className,
}: {
  adresse: string
  parametres: Readonly<Record<string, string>>
  total: number
  lignesParPage: number
  className?: string
}) => (
  <PiedDeListe
    className={className}
    liens={listeDesActivites.pagination.liens(
      { chemin: adresse, parametres },
      {
        totalItems: total,
        currentPage: listeDesActivites.charger(parametres).pagination.page,
        pageSize: lignesParPage,
      },
    )}
    pagination={paginationDesActivites}
  />
)
