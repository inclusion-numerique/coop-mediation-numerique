'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { consulterEmployeuseActuelle } from '@/features/employeuse/abilities/consulter-employeuse-actuelle/implementations/prisma/consulter-employeuse-actuelle.query'
import { AJOUTER_STRUCTURE_EMPLOYEUSE_EN_LIEU_ERRORS } from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/action/ajouter-structure-employeuse-en-lieu.errors'
import { StructureEmployeuseLieuValidation } from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/action/ajouter-structure-employeuse-en-lieu.validation'
import { ajouterStructureEmployeuseEnLieu } from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/domain/ajouter-structure-employeuse-en-lieu'
import { geocoderLAdresse } from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/implementations/ban/geocoder-l-adresse.query'
import { lireLAdresseDeLEmployeuse } from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/implementations/prisma/adresse-de-l-employeuse.query'
import { UtilisateurId } from '@/features/inscription/domain'
import { destinationDuLieuDecrit } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/domain/destination-du-lieu-decrit'
import { lieuCorreleAuLieuDecrit } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/domain/lieu-correle-au-lieu-decrit'
import {
  detacherDuLieu,
  rattacherAuLieuDecrit,
} from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementations/prisma/lieu-decrit.mutation'
import {
  lieuxAuMemeEndroit,
  nouvelIdentifiantDeLieu,
} from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementations/prisma/situation-du-lieu.query'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

export const ajouterStructureEmployeuseEnLieuAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(StructureEmployeuseLieuValidation))
  .execute(
    fromResult(
      async ({ user, input }) => {
        const resultat = await ajouterStructureEmployeuseEnLieu({
          consulterEmployeuseActuelle,
          lireLAdresseDeLEmployeuse,
          geocoderLAdresse,
          destinationDuLieuDecrit: destinationDuLieuDecrit({
            lieuxAuMemeEndroit,
            nouvelIdentifiantDeLieu,
          }),
          rattacherAuLieuDecrit,
          lieuCorreleAuLieuDecrit: lieuCorreleAuLieuDecrit({
            lieuxAuMemeEndroit,
          }),
          detacherDuLieu,
        })({
          userId: UtilisateurId(user.id),
          estLieuActivite: input.estLieuActivite,
          maintenant: new Date(),
        })

        return resultat.success ? success(undefined) : resultat
      },
      { onError: AJOUTER_STRUCTURE_EMPLOYEUSE_EN_LIEU_ERRORS },
    ),
  )
