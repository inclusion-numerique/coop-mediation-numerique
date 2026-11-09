import { craRouter } from '@app/web/server/rpc/cra/craRouter'
import { router } from '@app/web/server/rpc/createRouter'

export const appRouter = router({
  cra: craRouter,
})
// export type definition of API
export type AppRouter = typeof appRouter
