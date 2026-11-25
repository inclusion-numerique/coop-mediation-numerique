'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { RechercherStructureEmployeuseValidation } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/action/rechercher-structure-employeuse.validation'
import { rechercheStructureEmployeuseAvec } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/recherche-entreprises/recherche-structure-employeuse.query'
import { employeuseRecherchee } from '@/features/employeuse/ui/presenters/employeuse-recherchee.presenter'
import { withInput } from '@/libraries/nextjs'

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
  .use(withInput(RechercherStructureEmployeuseValidation))
  .execute(async ({ input: { query } }) =>
    rechercheStructureEmployeuseAvec(employeuseRecherchee)(query),
  )
