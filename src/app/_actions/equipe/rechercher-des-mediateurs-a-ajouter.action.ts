'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { RechercherDesMediateursAAjouterValidation } from '@/features/equipe/abilities/ajouter-un-membre/action/rechercher-des-mediateurs-a-ajouter.validation'
import { mediateursAAjouter } from '@/features/equipe/abilities/ajouter-un-membre/implementations/prisma/mediateurs-a-ajouter.query'
import { withInput } from '@/libraries/nextjs'

export const rechercherDesMediateursAAjouterAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(RechercherDesMediateursAAjouterValidation))
  .execute(({ input }) => mediateursAAjouter(input))
