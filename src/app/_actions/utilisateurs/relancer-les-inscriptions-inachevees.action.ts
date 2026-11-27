'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { retirerDuRegistre } from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { relancerLesInscriptionsInachevees } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/domain/relancer-les-inscriptions-inachevees'
import { envoyerLAvertissementDeSuppression as avertirDeLInscriptionInachevee } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/implementations/email/envoyer-l-avertissement-de-suppression.mutation'
import { envoyerLaRelance as relancerLInscription } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/implementations/email/envoyer-la-relance.mutation'
import { envoyerLaSuppressionDuCompte as aviserDeLInscriptionEffacee } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/implementations/email/envoyer-la-suppression-du-compte.mutation'
import { effacerLInscription } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/implementations/prisma'
import { inscriptionsInachevees } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/implementations/prisma/inscriptions-inachevees.query'
import {
  retirerLeContactDeLaListe,
  supprimerLeContact,
} from '@/features/utilisateurs/implementations/brevo/contact-brevo.mutation'
import { lireLaPresenceDuContact } from '@/features/utilisateurs/implementations/brevo/contact-brevo.query'
import { compterLesInscrits } from '@/features/utilisateurs/implementations/prisma/compter-les-inscrits.query'
import { noterLaRelance } from '@/features/utilisateurs/implementations/prisma/noter-la-relance.mutation'
import type { RetirerDuRegistre } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'

const lancerLesRelancesDInscription = async (
  maintenant: Date,
  retirerDuRegistre: RetirerDuRegistre,
) =>
  (
    await relancerLesInscriptionsInachevees({
      envoyerLaRelance: relancerLInscription(await compterLesInscrits()),
      envoyerLAvertissement: avertirDeLInscriptionInachevee,
      envoyerLAvisDEffacement: aviserDeLInscriptionEffacee,
      lireLesComptesARelancer: inscriptionsInachevees,
      noterLaRelance: noterLaRelance('Inscription'),
      effacerLInscription: effacerLInscription(retirerDuRegistre),
      retirerLeContactDeLaListe,
      lireLaPresenceDuContact,
      supprimerLeContact,
    })({ maintenant })
  ).data

export const relancerLesInscriptionsInacheveesAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .execute(async () => ({
    traites: (
      await lancerLesRelancesDInscription(new Date(), retirerDuRegistre)
    ).length,
  }))
