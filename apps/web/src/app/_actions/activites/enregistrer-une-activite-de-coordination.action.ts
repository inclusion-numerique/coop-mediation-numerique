'use server'

import type { SessionUser } from '@app/web/auth/sessionUser'
import {
  enregistrerUneActiviteDeCoordination,
  type TagsUtilisables,
} from '@app/web/features/activites/abilities/enregistrer-une-activite-de-coordination'
import { ENREGISTRER_UNE_ACTIVITE_DE_COORDINATION_ERRORS } from '@app/web/features/activites/abilities/enregistrer-une-activite-de-coordination/action/enregistrer-une-activite-de-coordination.errors'
import { EnregistrerUneActiviteDeCoordinationValidation } from '@app/web/features/activites/abilities/enregistrer-une-activite-de-coordination/action/enregistrer-une-activite-de-coordination.validation'
import {
  CoordinateurId,
  NomDeTag,
  TagId,
  UtilisateurId,
} from '@app/web/features/activites/domain'
import { withAuth } from '@app/web/features/authentification'
import { withMaintenance } from '@app/web/features/maintenance-mode'
import { lireLesTagsVisibles } from '@app/web/features/tags/abilities/lire-les-tags-visibles'
import { TagId as IdentifiantDeTag } from '@app/web/features/tags/domain'
import { acteurDe } from '@app/web/features/tags/implementation/session'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

const tagsUtilisablesPar =
  (user: SessionUser): TagsUtilisables =>
  async (tagIds) =>
    (
      await lireLesTagsVisibles({
        acteur: acteurDe(user),
        tagIds: tagIds.map(IdentifiantDeTag),
      })
    ).map(({ id, nom }) => ({ id: TagId(id), nom: NomDeTag(nom) }))

export const enregistrerUneActiviteDeCoordinationAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(EnregistrerUneActiviteDeCoordinationValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        enregistrerUneActiviteDeCoordination({
          saisie: input,
          coordinateurId:
            user.coordinateur == null
              ? null
              : CoordinateurId(user.coordinateur.id),
          auteurId: UtilisateurId(user.id),
          tagsUtilisables: tagsUtilisablesPar(user),
        }),
      { onError: ENREGISTRER_UNE_ACTIVITE_DE_COORDINATION_ERRORS },
    ),
  )
