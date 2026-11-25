import { removeBrevoUserContact } from '@/features/utilisateurs/implementations/brevo/remove-brevo-user-contact.mutation'
import { compterLesInscrits } from '@/features/utilisateurs/implementations/prisma/compter-les-inscrits.query'
import { noterLaRelance } from '@/features/utilisateurs/implementations/prisma/noter-la-relance.mutation'
import type { RetirerDuRegistre } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'
import { relancerLesInscriptionsInachevees } from '../domain/relancer-les-inscriptions-inachevees'
import { relancesParCourriel } from './email/relances-par-courriel.adapter'
import { effacerLInscription } from './prisma'
import { inscriptionsInachevees } from './prisma/inscriptions-inachevees.query'

export const lancerLesRelancesDInscription = async (
  maintenant: Date,
  retirerDuRegistre: RetirerDuRegistre,
) =>
  relancerLesInscriptionsInachevees({
    maintenant,
    ports: {
      ...relancesParCourriel(await compterLesInscrits()),
      lireLesComptesARelancer: inscriptionsInachevees,
      noterLaRelance: noterLaRelance('Inscription'),
      effacerLInscription: effacerLInscription(retirerDuRegistre),
      retirerDesListes: async (courriel) => {
        await removeBrevoUserContact(courriel)
      },
    },
  })
