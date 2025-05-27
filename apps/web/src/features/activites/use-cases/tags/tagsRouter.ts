import { isCoordinateur, isMediateur } from '@app/web/auth/userTypeGuards'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { CreateTagValidation, TagScope } from './create/createTagValidation'
import { createTagDepartemental } from './create/db/createTagDepartemental'
import { createTagPersonnel } from './create/db/createTagPersonnel'

export const tagsRouter = router({
  create: protectedProcedure
    .input(CreateTagValidation)
    .mutation(async ({ input, ctx: { user: sessionUser } }) => {
      if (input.scope === TagScope.Personnel || !isCoordinateur(sessionUser))
        await createTagPersonnel(sessionUser)(input)

      if (input.scope === TagScope.Departemental || !isMediateur(sessionUser))
        await createTagDepartemental(sessionUser)(input)
    }),
})
