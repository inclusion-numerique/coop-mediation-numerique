'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { retirerDuRegistre } from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { relancerLesInscriptionsInachevees } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/domain/relancer-les-inscriptions-inachevees'
import { relancesDInscriptionParCourriel } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/implementations/email/relances-d-inscription-par-courriel.adapter'
import { effacerLInscription } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/implementations/prisma'
import { inscriptionsInachevees } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/implementations/prisma/inscriptions-inachevees.query'
import { removeBrevoUserContact } from '@/features/utilisateurs/implementations/brevo/remove-brevo-user-contact.mutation'
import { compterLesInscrits } from '@/features/utilisateurs/implementations/prisma/compter-les-inscrits.query'
import { noterLaRelance } from '@/features/utilisateurs/implementations/prisma/noter-la-relance.mutation'
import type { RetirerDuRegistre } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'

const lancerLesRelancesDInscription = async (
  maintenant: Date,
  retirerDuRegistre: RetirerDuRegistre,
) =>
  relancerLesInscriptionsInachevees({
    maintenant,
    ports: {
      ...relancesDInscriptionParCourriel(await compterLesInscrits()),
      lireLesComptesARelancer: inscriptionsInachevees,
      noterLaRelance: noterLaRelance('Inscription'),
      effacerLInscription: effacerLInscription(retirerDuRegistre),
      retirerDesListes: async (courriel) => {
        await removeBrevoUserContact(courriel)
      },
    },
  })

export const relancerLesInscriptionsInacheveesAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .execute(async () => ({
    traites: (
      await lancerLesRelancesDInscription(new Date(), retirerDuRegistre)
    ).length,
  }))
