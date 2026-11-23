'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { rechercherEmployeuse } from '@/features/employeuse/abilities/rechercher-employeuse/implementations'
import { employeuseAffichage } from '@/features/employeuse/ui/employeuse.presenter'
import { RechercherDesEmployeusesValidation } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/action/rechercher-des-employeuses.validation'
import { withInput } from '@/libraries/nextjs'

export const rechercherDesEmployeusesAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(RechercherDesEmployeusesValidation))
  .execute(async ({ input: { recherche } }) => {
    const { employeuses } = await rechercherEmployeuse({
      recherche,
      limite: 20,
    })

    return employeuses.map((employeuse) => {
      const affichage = employeuseAffichage(employeuse)
      return {
        value: String(affichage.id),
        label: [affichage.nom, affichage.commune].filter(Boolean).join(' · '),
      }
    })
  })
