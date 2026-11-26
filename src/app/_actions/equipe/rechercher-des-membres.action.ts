'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { RechercherDesMembresValidation } from '@/features/equipe/abilities/lister-les-membres-a-filtrer/action/rechercher-des-membres.validation'
import { listerLesMembresAFiltrer } from '@/features/equipe/abilities/lister-les-membres-a-filtrer/domain/lister-les-membres-a-filtrer'
import {
  lireLeDemandeur,
  lireLesMembresAFiltrer,
} from '@/features/equipe/abilities/lister-les-membres-a-filtrer/implementations/prisma/membres-a-filtrer.query'
import { demandeurDuFiltre } from '@/features/equipe/abilities/lister-les-membres-a-filtrer/implementations/session/demandeur-du-filtre.query'
import { optionDeMembre } from '@/features/equipe/abilities/lister-les-membres-a-filtrer/ui/presenters/options-de-membres.presenter'
import { withInput } from '@/libraries/nextjs'

export const rechercherDesMembresAction = actionBuilder()
  .use(withAuth())
  .use(withInput(RechercherDesMembresValidation))
  .execute(async ({ user, input: { recherche } }) => {
    const membres = await listerLesMembresAFiltrer({
      lireLeDemandeur,
      lireLesMembresAFiltrer,
    })({ ...demandeurDuFiltre(user), recherche })
    return membres.success ? membres.data.map(optionDeMembre) : []
  })
