'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { RechercherDesMembresValidation } from '@/features/equipe/abilities/lister-les-membres-a-filtrer/action/rechercher-des-membres.validation'
import { membresRecherches } from '@/features/equipe/abilities/lister-les-membres-a-filtrer/domain'
import { membresAFiltrerDuDemandeur } from '@/features/equipe/abilities/lister-les-membres-a-filtrer/implementations/prisma/membres-a-filtrer-du-demandeur.query'
import { optionDeMembre } from '@/features/equipe/abilities/lister-les-membres-a-filtrer/ui/presenters/options-de-membres.presenter'
import { withInput } from '@/libraries/nextjs'

export const rechercherDesMembresAction = actionBuilder()
  .use(withAuth())
  .use(withInput(RechercherDesMembresValidation))
  .execute(async ({ user, input: { recherche } }) =>
    membresRecherches(await membresAFiltrerDuDemandeur(user), recherche).map(
      optionDeMembre,
    ),
  )
