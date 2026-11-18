'use server'

import { z } from 'zod'
import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin, withAuth } from '@/features/authentification'
import { employeuseAffichage } from '@/features/employeuse'
import { rechercherEmployeuse } from '@/features/employeuse/server'
import { withInput } from '@/libraries/nextjs'

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
