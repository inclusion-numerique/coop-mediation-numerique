'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { RENSEIGNER_LIEUX_ACTIVITE_ERRORS } from '@/features/inscription/abilities/renseigner-lieux-activite/action/renseigner-lieux-activite.errors'
import { RenseignerLieuxActiviteValidation } from '@/features/inscription/abilities/renseigner-lieux-activite/action/renseigner-lieux-activite.validation'
import type { EchecDeRenseignerLieuxActivite } from '@/features/inscription/abilities/renseigner-lieux-activite/domain'
import type {
  LireLieuxActiviteExistants,
  TrouverStructuresCarto,
} from '@/features/inscription/abilities/renseigner-lieux-activite/domain/ports'
import { renseignerLieuxActivite } from '@/features/inscription/abilities/renseigner-lieux-activite/domain/renseigner-lieux-activite'
import type { RattacherAuLieuDesire } from '@/features/inscription/abilities/renseigner-lieux-activite/implementations/prisma/enregistrer-reconciliation.mutation'
import { enregistrerReconciliation } from '@/features/inscription/abilities/renseigner-lieux-activite/implementations/prisma/enregistrer-reconciliation.mutation'
import { UtilisateurId } from '@/features/inscription/domain'
import { getInscriptionEtat } from '@/features/inscription/implementations/prisma/get-inscription-etat.query'
import { structuresCartoParIds } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementations/entrepot/structures-carto.query'
import { activitesEnCoursDeLUtilisateur } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementations/prisma/activites-en-cours.query'
import { rattacherAuLieuDesire } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementations/prisma/rattacher-au-lieu-desire.mutation'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { fromResult, withInput } from '@/libraries/nextjs'
import { type Result, success } from '@/libraries/result'

const renseignerLieuxActiviteAvec = <StructureCarto>({
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

export const renseignerLieuxActiviteAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(RenseignerLieuxActiviteValidation))
  .execute(
    fromResult(
      async ({
        user,
        input,
      }): Promise<Result<undefined, EchecDeRenseignerLieuxActivite>> => {
        const resultat = await renseignerLieuxActiviteAvec({
          trouverStructuresCarto: structuresCartoParIds,
          lireLieuxActiviteExistants: activitesEnCoursDeLUtilisateur,
          rattacherAuLieuDesire,
        })({
          command: {
            userId: UtilisateurId(user.id),
            lieuxActivite: input.lieux,
          },
          maintenant: new Date(),
        })

        return resultat.success ? success(undefined) : resultat
      },
      { onError: RENSEIGNER_LIEUX_ACTIVITE_ERRORS },
    ),
  )
