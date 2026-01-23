import { isCoordinateur } from '@app/web/auth/userTypeGuards'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { z } from 'zod'
import { isTagOwner } from './db/isTagOwner'
import { deleteTag } from './delete/db/deleteTag'
import { DeleteTagValidation } from './delete/deleteTagValidation'
import { createTagDepartemental } from './save/db/createTagDepartemental'
import {
  canCreateTagForEquipe,
  createTagEquipe,
} from './save/db/createTagEquipe'
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
    .query(({ input: { query, excludeIds } }) =>
      searchTags({
        searchParams: { lignes: '10', recherche: query },
        excludeIds,
      }),
    ),
  save: protectedProcedure
    .input(SaveTagValidation)
    .mutation(async ({ input, ctx: { user: sessionUser } }) => {
      const { id, equipeId, ...tag } = input

      if (id != null && (await isTagOwner(sessionUser)(id)))
        return await updateTag(sessionUser)({ ...tag, id })

      if (input.scope === TagScope.Personnel)
        return await createTagPersonnel(sessionUser)(tag)

      if (
        input.scope === TagScope.Equipe &&
        equipeId != null &&
        canCreateTagForEquipe(sessionUser, equipeId)
      )
        return await createTagEquipe(equipeId)(tag)

      if (input.scope === TagScope.Departemental && isCoordinateur(sessionUser))
        return await createTagDepartemental(sessionUser)(tag)
    }),
  delete: protectedProcedure
    .input(DeleteTagValidation)
    .mutation(async ({ input, ctx: { user: sessionUser } }) => {
      if (!(await isTagOwner(sessionUser)(input.id))) return
      return await deleteTag(input.id)
    }),
})
