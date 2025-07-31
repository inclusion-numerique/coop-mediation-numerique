import { isCoordinateur, isMediateur } from '@app/web/auth/userTypeGuards'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { forbiddenError } from '@app/web/server/rpc/trpcErrors'
import { z } from 'zod'
import { isTagOwner } from './db/isTagOwner'
import { deleteTag } from './delete/db/deleteTag'
import { DeleteTagValidation } from './delete/deleteTagValidation'
import { createTagDepartemental } from './save/db/createTagDepartemental'
import { createTagPersonnel } from './save/db/createTagPersonnel'
import { updateTag } from './save/db/updateTag'
import { SaveTagValidation } from './save/saveTagValidation'
import { searchTags } from './search/searchTags'
import { TagScope } from './tagScope'

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
  save: protectedProcedure
    .input(SaveTagValidation)
    .mutation(async ({ input, ctx: { user: sessionUser } }) => {
      const { id, ...tag } = input

      if (id != null && isTagOwner(sessionUser)(id)) {
        return await updateTag(sessionUser)({ ...tag, id })
      }

      if (input.scope === TagScope.Personnel || !isCoordinateur(sessionUser))
        return await createTagPersonnel(sessionUser)(tag)

      if (input.scope === TagScope.Departemental || !isMediateur(sessionUser))
        return await createTagDepartemental(sessionUser)(tag)
    }),
  delete: protectedProcedure
    .input(DeleteTagValidation)
    .mutation(async ({ input, ctx: { user: sessionUser } }) => {
      if (!isTagOwner(sessionUser)(input.id)) return
      return await deleteTag(input.id)
    }),
})
