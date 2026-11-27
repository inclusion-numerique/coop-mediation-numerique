'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { CHOISIR_PROFIL_ERRORS } from '@/features/inscription/abilities/choisir-profil/action/choisir-profil.errors'
import { ChoisirProfilValidation } from '@/features/inscription/abilities/choisir-profil/action/choisir-profil.validation'
import { choisirProfil } from '@/features/inscription/abilities/choisir-profil/domain/choisir-profil'
import { enregistrerProfilChoisi } from '@/features/inscription/abilities/choisir-profil/implementations/prisma/enregistrer-profil-choisi.mutation'
import { UtilisateurId } from '@/features/inscription/domain'
import { getInscriptionEtat } from '@/features/inscription/implementations/prisma/get-inscription-etat.query'
import type { SynchroniserLaPersonne } from '@/features/inscription/implementations/prisma/synchroniser-la-personne.mutation'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { synchroniserPersonne } from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

const choisirProfilAvec = (synchroniserLaPersonne: SynchroniserLaPersonne) =>
  choisirProfil({
    lireLEtat: getInscriptionEtat,
    enregistrerProfilChoisi: enregistrerProfilChoisi(synchroniserLaPersonne),
  })

export const choisirProfilAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(ChoisirProfilValidation))
  .execute(
    fromResult(
      async ({ input, user }) => {
        const resultat = await choisirProfilAvec(synchroniserPersonne)({
          userId: UtilisateurId(user.id),
          role: input.role,
          maintenant: new Date(),
        })

        return resultat.success
          ? success({
              role: resultat.data.role,
              etapeSuivante: resultat.data.etapeSuivante,
            })
          : resultat
      },
      { onError: CHOISIR_PROFIL_ERRORS },
    ),
  )
