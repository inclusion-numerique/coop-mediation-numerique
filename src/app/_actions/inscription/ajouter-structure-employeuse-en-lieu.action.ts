'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { consulterEmployeuseActuelle } from '@/features/employeuse/abilities/consulter-employeuse-actuelle/domain/consulter-employeuse-actuelle'
import { UtilisateurId as UtilisateurIdDeLEmployeuse } from '@/features/employeuse/domain'
import { lireLEmploiActuel } from '@/features/employeuse/implementations/prisma/emploi-actuel.query'
import { AJOUTER_STRUCTURE_EMPLOYEUSE_EN_LIEU_ERRORS } from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/action/ajouter-structure-employeuse-en-lieu.errors'
import { StructureEmployeuseLieuValidation } from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/action/ajouter-structure-employeuse-en-lieu.validation'
import { employeuseLue } from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/action/employeuse-lue.transfer'
import { ajouterStructureEmployeuseEnLieu } from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/domain/ajouter-structure-employeuse-en-lieu'
import { geocoderLAdresse } from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/implementations/ban/geocoder-l-adresse.query'
import { lireLAdresseDeLEmployeuse } from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/implementations/prisma/adresse-de-l-employeuse.query'
import { UtilisateurId } from '@/features/inscription/domain'
import {
  detacherDuLieu,
  rattacherAuLieuDecrit,
} from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementations/prisma/lieu-decrit.mutation'
import { nouvelIdentifiantDeLieu } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementations/prisma/situation-du-lieu.query'
import { destinationDuLieuDecrit } from '@/features/lieux-activite/domain/destination-du-lieu-decrit'
import { lieuCorreleAuLieuDecrit } from '@/features/lieux-activite/domain/lieu-correle-au-lieu-decrit'
import { lieuxAuMemeEndroit } from '@/features/lieux-activite/implementations/prisma/lieux-au-meme-endroit.query'
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
        const maintenant = new Date()
        const resultat = await ajouterStructureEmployeuseEnLieu({
          consulterEmployeuseActuelle: ({ userId }) =>
            consulterEmployeuseActuelle({ lireLEmploiActuel })({
              utilisateurId: UtilisateurIdDeLEmployeuse(userId),
              maintenant,
            }).then(({ data }) => employeuseLue(data)),
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
          maintenant,
        })

        return resultat.success ? success(undefined) : resultat
      },
      { onError: AJOUTER_STRUCTURE_EMPLOYEUSE_EN_LIEU_ERRORS },
    ),
  )
