'use server'

import { withAuth } from '@app/web/features/authentification'
import { rechercherUnLieuActivite } from '@app/web/features/lieux-activite/abilities/rechercher-un-lieu-activite'
import { MediateurId } from '@app/web/features/lieux-activite/domain/mediateur-id'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'
import { z } from 'zod'

/**
 * Les suggestions du combo-box.
 *
 * Qui n'est pas médiateur n'exerce nulle part : la recherche rend une liste
 * vide plutôt qu'une erreur, parce qu'un champ de saisie n'a rien à faire d'un
 * refus — il n'a simplement rien à proposer.
 */
export const rechercherUnLieuActiviteAction = actionBuilder()
  .use(withAuth())
  .use(withInput(z.object({ recherche: z.string() })))
  .execute(async ({ user, input }) =>
    user.mediateur == null
      ? []
      : rechercherUnLieuActivite({
          mediateurId: MediateurId(user.mediateur.id),
          recherche: input.recherche,
        }),
  )
