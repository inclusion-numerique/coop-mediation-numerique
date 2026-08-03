'use server'

import { withAuth } from '@app/web/features/authentification'
import { searchStructureEmployeuseCombined } from '@app/web/features/inscription/use-cases/renseigner-structure-employeuse/searchStructureEmployeuseCombined'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'
import { z } from 'zod'

/**
 * Recherche d'employeuse pour l'étape d'inscription : structures déjà
 * enregistrées et annuaire des entreprises, fusionnés.
 *
 * La partie « employeuses déjà enregistrées » est l'ability `rechercher-employeuse` ;
 * la fusion avec l'annuaire des entreprises reste ici, parce qu'elle sert aussi
 * les lieux d'activité et trouvera sa place avec eux.
 */
export const rechercherStructureEmployeuseAction = actionBuilder()
  .use(withAuth())
  .use(withInput(z.object({ query: z.string() })))
  .execute(async ({ input: { query } }) =>
    searchStructureEmployeuseCombined(query),
  )
