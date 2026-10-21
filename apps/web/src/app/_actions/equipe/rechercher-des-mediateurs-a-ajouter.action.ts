'use server'

import { withAdmin, withAuth } from '@app/web/features/authentification'
import { mediateursAAjouter } from '@app/web/features/equipe/abilities/ajouter-un-membre'
import { RechercherDesMediateursAAjouterValidation } from '@app/web/features/equipe/abilities/ajouter-un-membre/action/rechercher-des-mediateurs-a-ajouter.validation'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'

export const rechercherDesMediateursAAjouterAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(RechercherDesMediateursAAjouterValidation))
  .execute(({ input }) => mediateursAAjouter(input))
