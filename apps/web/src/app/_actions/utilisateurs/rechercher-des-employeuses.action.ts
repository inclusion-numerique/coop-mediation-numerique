'use server'

import { withAdmin, withAuth } from '@app/web/features/authentification'
import { employeuseAffichage } from '@app/web/features/employeuse'
import { rechercherEmployeuse } from '@app/web/features/employeuse/server'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'
import { z } from 'zod'

export const rechercherDesEmployeusesAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(z.object({ recherche: z.string().trim().min(3) })))
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
