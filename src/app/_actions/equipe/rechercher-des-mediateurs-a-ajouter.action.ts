'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin, withAuth } from '@/features/authentification'
import { mediateursAAjouter } from '@/features/equipe/abilities/ajouter-un-membre'
import { RechercherDesMediateursAAjouterValidation } from '@/features/equipe/abilities/ajouter-un-membre/action/rechercher-des-mediateurs-a-ajouter.validation'
import { withInput } from '@/libraries/nextjs'

export const rechercherDesMediateursAAjouterAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(RechercherDesMediateursAAjouterValidation))
  .execute(({ input }) => mediateursAAjouter(input))
