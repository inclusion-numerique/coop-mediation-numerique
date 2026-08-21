'use server'

import { withAuth } from '@app/web/features/authentification'
import { searchStructureEmployeuseCombined } from '@app/web/features/employeuse/abilities/rattacher-a-une-employeuse/implementation/recherche-structure-employeuse'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'
import { z } from 'zod'

/**
 * Recherche d'employeuse : structures déjà enregistrées et annuaire des
 * entreprises, fusionnés. Sert partout où l'on demande sa structure employeuse
 * à quelqu'un — l'étape d'inscription comme la garde de la saisie d'un CRA.
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
