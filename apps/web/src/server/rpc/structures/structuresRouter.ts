import { searchStructuresEmployeuses } from '@app/web/features/employeuse/getStructuresEmployeusesOptions'
import { mediateurCoordonnesEtAnciensIdsFor } from '@app/web/mediateurs/mediateurCoordonnesIdsFor'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { z } from 'zod'

export const structuresRouter = router({
  searchStructuresEmployeuses: protectedProcedure
    .input(
      z.object({
        query: z.string(),
        excludeIds: z.array(z.string().regex(/^\d+$/)).optional(),
      }),
    )
    .query(({ input: { query, excludeIds }, ctx: { user } }) => {
      const mediateurIds = [
        ...(user.mediateur?.id ? [user.mediateur.id] : []),
        ...mediateurCoordonnesEtAnciensIdsFor(user),
      ]
      return searchStructuresEmployeuses({
        query,
        mediateurIds,
        coordinateurId: user.coordinateur?.id,
        excludeIds,
      })
    }),
})
