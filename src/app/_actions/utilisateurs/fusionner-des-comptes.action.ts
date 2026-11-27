'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { signaler } from '@/configuration/telemetry/serveur'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { synchroniserPersonne } from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { FUSIONNER_DES_COMPTES_ERRORS } from '@/features/utilisateurs/abilities/fusionner-des-comptes/action/fusionner-des-comptes.errors'
import { FusionnerDesComptesValidation } from '@/features/utilisateurs/abilities/fusionner-des-comptes/action/fusionner-des-comptes.validation'
import { fusionnerDesComptes } from '@/features/utilisateurs/abilities/fusionner-des-comptes/domain/fusionner-des-comptes'
import { comptesAFusionner } from '@/features/utilisateurs/abilities/fusionner-des-comptes/implementations/prisma/comptes-a-fusionner.query'
import { fusionner } from '@/features/utilisateurs/abilities/fusionner-des-comptes/implementations/prisma/fusionner.mutation'
import { UtilisateurId } from '@/features/utilisateurs/domain'
import {
  retirerLeContactDeLaListe,
  supprimerLeContact,
} from '@/features/utilisateurs/implementations/brevo/contact-brevo.mutation'
import { lireLaPresenceDuContact } from '@/features/utilisateurs/implementations/brevo/contact-brevo.query'
import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

const fusionnerDesComptesAvec = (
  synchroniserLaPersonne: SynchroniserLaPersonne,
) =>
  fusionnerDesComptes({
    lireLesComptesAFusionner: comptesAFusionner,
    fusionner: fusionner(synchroniserLaPersonne),
    retirerLeContactDeLaListe,
    lireLaPresenceDuContact,
    supprimerLeContact,
  })

export const fusionnerDesComptesAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(FusionnerDesComptesValidation))
  .execute(
    fromResult(
      async ({ input }) => {
        const resultat = await fusionnerDesComptesAvec(synchroniserPersonne)({
          sourceId: UtilisateurId.safe(input.sourceId),
          cibleId: UtilisateurId.safe(input.cibleId),
          maintenant: new Date(),
        })
        if (!resultat.success) return resultat
        const { retraitDeLaSource } = resultat.data
        if (retraitDeLaSource._tag === 'NonRetire')
          signaler(retraitDeLaSource.echec.cause)
        return success(undefined)
      },
      { onError: FUSIONNER_DES_COMPTES_ERRORS },
    ),
  )
