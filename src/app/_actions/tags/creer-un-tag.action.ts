'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { CREER_UN_TAG_ERRORS } from '@/features/tags/abilities/creer-un-tag/action/creer-un-tag.errors'
import type { Visibilite } from '@/features/tags/abilities/creer-un-tag/action/creer-un-tag.validation'
import { CreerUnTagValidation } from '@/features/tags/abilities/creer-un-tag/action/creer-un-tag.validation'
import { creerUnTag } from '@/features/tags/abilities/creer-un-tag/implementations/prisma/creer-un-tag.mutation'
import {
  acteurDe,
  CoordinateurId,
  DescriptionDuTag,
  NomDuTag,
  type VisibiliteChoisie,
} from '@/features/tags/domain'
import { tagAffiche } from '@/features/tags/ui/presenters/tag-affiche.presenter'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

const visibiliteChoisie = (visibilite: Visibilite): VisibiliteChoisie =>
  visibilite._tag === 'Equipe'
    ? {
        _tag: 'Equipe',
        coordinateurId: CoordinateurId(visibilite.coordinateurId),
      }
    : visibilite

export const creerUnTagAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(CreerUnTagValidation))
  .execute(
    fromResult(
      async ({ user, input }) => {
        const acteur = acteurDe(profilDeLaSession(user))
        const cree = await creerUnTag({
          acteur,
          nom: NomDuTag(input.nom),
          description: DescriptionDuTag.safe(input.description ?? ''),
          visibilite: visibiliteChoisie(input.visibilite),
        })

        return cree.success ? success(tagAffiche(acteur)(cree.data)) : cree
      },
      { onError: CREER_UN_TAG_ERRORS },
    ),
  )
