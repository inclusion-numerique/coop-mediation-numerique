import { Sort } from '@arckit/resultset'
import {
  type BeneficiaireId,
  type ChronologieDesActivites,
  CRITERES_VIDES,
  contenuDeLaChronologie,
  type MediateurId,
  type Pagination,
  type RendezVousDuCompte,
} from '../../../../domain'
import type { RendezVousLies } from '../../../../implementations/prisma/rendez-vous-fournis.transfer'
import { listerMesActivites, type RendezVousALister } from './chronologie.query'

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
  const criteres = { ...CRITERES_VIDES, beneficiaires: [beneficiaireId] }
  return listerMesActivites({
    mediateurId,
    criteres,
    pagination,
    ordre: Sort('date', 'desc'),
    contenu: contenuDeLaChronologie(criteres, compte),
    rendezVous,
    rendezVousLies,
  })
}
