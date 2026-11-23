import { getInscriptionEtat } from '@/features/inscription/implementations/prisma/get-inscription-etat.query'
import type {
  LireLieuxActiviteExistants,
  TrouverStructuresCarto,
} from '../domain/ports'
import { renseignerLieuxActivite } from '../domain/renseigner-lieux-activite'
import {
  enregistrerReconciliation,
  type RattacherAuLieuDesire,
} from './prisma/enregistrer-reconciliation.mutation'

export const renseignerLieuxActiviteAvec = <StructureCarto>({
  trouverStructuresCarto,
  lireLieuxActiviteExistants,
  rattacherAuLieuDesire,
}: {
  readonly trouverStructuresCarto: TrouverStructuresCarto<StructureCarto>
  readonly lireLieuxActiviteExistants: LireLieuxActiviteExistants
  readonly rattacherAuLieuDesire: RattacherAuLieuDesire<StructureCarto>
}) =>
  renseignerLieuxActivite({
    lireLEtat: getInscriptionEtat,
    lireLieuxActiviteExistants,
    trouverStructuresCarto,
    enregistrerReconciliation: enregistrerReconciliation(rattacherAuLieuDesire),
  })
