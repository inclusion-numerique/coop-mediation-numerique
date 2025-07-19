import { isCoordinateur, isMediateur } from '@app/web/auth/userTypeGuards'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { forbiddenError } from '@app/web/server/rpc/trpcErrors'
import { z } from 'zod'
import { CreateTagValidation, TagScope } from './create/createTagValidation'
import { createTagDepartemental } from './create/db/createTagDepartemental'
import { createTagPersonnel } from './create/db/createTagPersonnel'
import { searchTags } from './search/searchTags'

export const tagsRouter = router({
  search: protectedProcedure
    .input(
      z.object({
        query: z.string(),
        excludeIds: z.array(z.string()).default([]),
      }),
    )
    .query(({ input: { query, excludeIds }, ctx: { user } }) => {
      if (!user.mediateur && user.role !== 'Admin') {
        throw forbiddenError('User is not a mediateur')
      }

      return searchTags({
        mediateurId: user.mediateur?.id,
        searchParams: { lignes: '10', recherche: query },
        excludeIds,
      })
    }),
  create: protectedProcedure
    .input(CreateTagValidation)
    .mutation(async ({ input, ctx: { user: sessionUser } }) => {
      if (input.scope === TagScope.Personnel || !isCoordinateur(sessionUser))
        await createTagPersonnel(sessionUser)(input)

      if (input.scope === TagScope.Departemental || !isMediateur(sessionUser))
        await createTagDepartemental(sessionUser)(input)
    }),
})
