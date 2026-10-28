'use server'

import { withAuth } from '@app/web/features/authentification'
import { withMaintenance } from '@app/web/features/maintenance-mode'
import { creerUnTag } from '@app/web/features/tags/abilities/creer-un-tag'
import { CREER_UN_TAG_ERRORS } from '@app/web/features/tags/abilities/creer-un-tag/action/creer-un-tag.errors'
import type { VisibiliteValidation } from '@app/web/features/tags/abilities/creer-un-tag/action/creer-un-tag.validation'
import { CreerUnTagValidation } from '@app/web/features/tags/abilities/creer-un-tag/action/creer-un-tag.validation'
import {
  CoordinateurId,
  DescriptionDuTag,
  NomDuTag,
  type VisibiliteChoisie,
} from '@app/web/features/tags/domain'
import { acteurDe } from '@app/web/features/tags/implementation/session'
import { tagAffiche } from '@app/web/features/tags/ui/tag-affiche.presenter'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'
import { success } from '@app/web/libraries/result'
import type { z } from 'zod'

const visibiliteChoisie = (
  visibilite: z.output<typeof VisibiliteValidation>,
): VisibiliteChoisie =>
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
        const acteur = acteurDe(user)
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
