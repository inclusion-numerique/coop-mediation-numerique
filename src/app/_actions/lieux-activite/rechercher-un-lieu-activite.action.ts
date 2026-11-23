'use server'

import { z } from 'zod'
import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { rechercherUnLieuActivite } from '@/features/lieux-activite/abilities/rechercher-un-lieu-activite'
import { MediateurId } from '@/features/lieux-activite/domain/identifiants/mediateur-id'
import { withInput } from '@/libraries/nextjs'

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
