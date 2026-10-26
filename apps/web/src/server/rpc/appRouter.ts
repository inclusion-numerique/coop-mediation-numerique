import { tagsRouter } from '@app/web/features/activites/use-cases/tags/tagsRouter'
import { craRouter } from '@app/web/server/rpc/cra/craRouter'
import { router } from '@app/web/server/rpc/createRouter'

export const appRouter = router({
  cra: craRouter,
  tags: tagsRouter,
})
// export type definition of API
export type AppRouter = typeof appRouter
