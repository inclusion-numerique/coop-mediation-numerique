'use server'

import { withAuth } from '@app/web/features/authentification'
import { searchStructureEmployeuseCombined } from '@app/web/features/inscription/use-cases/renseigner-structure-employeuse/searchStructureEmployeuseCombined'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'
import { z } from 'zod'

/**
 * Recherche d'employeuse pour l'étape d'inscription : structures déjà
 * enregistrées et annuaire des entreprises, fusionnés.
 *
 * Action mince et volontairement provisoire — elle expose l'existant en server
 * action pour que le formulaire se passe de tRPC. La recherche deviendra une
 * ability de la feature employeuse, avec son propre domaine, quand les lectures
 * d'administration migreront.
 */
export const rechercherStructureEmployeuseAction = actionBuilder()
  .use(withAuth())
  .use(withInput(z.object({ query: z.string() })))
  .execute(async ({ input: { query } }) =>
    searchStructureEmployeuseCombined(query),
  )
