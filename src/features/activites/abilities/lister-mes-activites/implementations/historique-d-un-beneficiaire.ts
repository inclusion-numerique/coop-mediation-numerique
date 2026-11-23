import {
  type BeneficiaireId,
  type ChronologieDesActivites,
  contenuDeLaChronologie,
  criteresDesActivites,
  type MediateurId,
  OrdreChronologique,
  type Pagination,
  type RendezVousDuCompte,
} from '../../../domain'
import type { RendezVousLies } from '../../../implementations/prisma/rendez-vous-fournis'
import {
  listerMesActivites,
  type RendezVousALister,
} from './prisma/chronologie.query'

export const listerLHistoriqueDUnBeneficiaire = ({
  mediateurId,
  beneficiaireId,
  pagination,
  compte,
  rendezVous,
  rendezVousLies,
}: {
  readonly mediateurId: MediateurId
  readonly beneficiaireId: BeneficiaireId
  readonly pagination: Pagination
  readonly compte: RendezVousDuCompte
  readonly rendezVous: RendezVousALister | null
  readonly rendezVousLies: RendezVousLies
}): Promise<ChronologieDesActivites> => {
  const criteres = criteresDesActivites({ beneficiaires: beneficiaireId })
  return listerMesActivites({
    mediateurId,
    criteres,
    pagination,
    ordre: OrdreChronologique('PlusRecentes'),
    contenu: contenuDeLaChronologie(criteres, compte),
    rendezVous,
    rendezVousLies,
  })
}
