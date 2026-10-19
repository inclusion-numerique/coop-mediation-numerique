import { isCoordinateur, isMediateur } from '@app/web/auth/userTypeGuards'
import { togglePartageStatistiques } from '@app/web/features/mediateurs/use-cases/partage-statistiques/db/togglePartageStatistiques'
import { searchMediateur } from '@app/web/mediateurs/searchMediateurs'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { forbiddenError } from '@app/web/server/rpc/trpcErrors'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { createStopwatch } from '@app/web/utils/stopwatch'
import { z } from 'zod'

export const mediateursRouter = router({
  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(({ input: { query }, ctx: { user } }) => {
      if (!user.coordinateur && user.role !== 'Admin')
        throw forbiddenError('User is not a coordinateur')

      return searchMediateur({
        coordinateurId: user.coordinateur?.id,
        searchParams: { recherche: query },
      })
    }),
  shareStats: protectedProcedure.mutation(async ({ ctx: { user } }) => {
    const stopwatch = createStopwatch()

    if (!isMediateur(user) && !isCoordinateur(user))
      throw forbiddenError('User cannot share stats')

    const result = await togglePartageStatistiques(user)

    addMutationLog({
      userId: user?.id ?? null,
      nom: 'SetMediateurVisibility',
      duration: stopwatch.stop().duration,
      data: {
        email: user.email,
      },
    })

    return result?.active
  }),
})
