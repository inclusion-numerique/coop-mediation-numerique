'use server'

import { withAuth } from '@app/web/features/authentification'
import { searchLieuActiviteCombined } from '@app/web/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementation/searchLieuActiviteCombined'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'
import { z } from 'zod'

/**
 * Les suggestions du champ d'ajout : la coop, la cartographie nationale et,
 * en dernier recours, l'annuaire des entreprises.
 *
 * La recherche elle-même vit encore dans `src/structure/` — elle attend sa
 * propre ability. Ce qui compte ici, c'est qu'elle ne franchisse plus la
 * frontière du navigateur : elle tirait le client Prisma dans le bundle.
 */
export const rechercherDesLieuxAAjouterAction = actionBuilder()
  .use(withAuth())
  .use(withInput(z.object({ recherche: z.string() })))
  .execute(async ({ input }) => searchLieuActiviteCombined(input.recherche))
