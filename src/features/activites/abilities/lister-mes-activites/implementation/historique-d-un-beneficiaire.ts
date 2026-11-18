import type { FiltreDesConseillersNumeriques } from '../../../db/criteres-des-activites.sql'
import type { RendezVousLies } from '../../../db/rendez-vous-fournis'
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
  conseillersNumeriques,
}: {
  readonly mediateurId: MediateurId
  readonly beneficiaireId: BeneficiaireId
  readonly pagination: Pagination
  readonly compte: RendezVousDuCompte
  readonly rendezVous: RendezVousALister | null
  readonly rendezVousLies: RendezVousLies
  readonly conseillersNumeriques: FiltreDesConseillersNumeriques
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
    conseillersNumeriques,
  })
}
