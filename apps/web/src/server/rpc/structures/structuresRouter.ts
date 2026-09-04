import { searchStructuresEmployeuses } from '@app/web/features/employeuse/getStructuresEmployeusesOptions'
import { mediateurCoordonnesIdsFor } from '@app/web/mediateurs/mediateurCoordonnesIdsFor'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { z } from 'zod'

export const structuresRouter = router({
  searchStructuresEmployeuses: protectedProcedure
    .input(
      z.object({
        query: z.string(),
        excludeIds: z.array(z.string().uuid()).optional(),
      }),
    )
    .query(({ input: { query, excludeIds }, ctx: { user } }) => {
      const mediateurIds = [
        ...(user.mediateur?.id ? [user.mediateur.id] : []),
        ...mediateurCoordonnesIdsFor(user),
      ]
      return searchStructuresEmployeuses({ query, mediateurIds, excludeIds })
    }),
})
