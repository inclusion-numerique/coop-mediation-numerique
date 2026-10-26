import { tagsRouter } from '@app/web/features/activites/use-cases/tags/tagsRouter'
import { maintenanceRouter } from '@app/web/features/maintenance-mode/use-cases/administration/maintenanceRouter'
import { apiClientRouter } from '@app/web/server/rpc/apiClient/apiClientRouter'
import { craRouter } from '@app/web/server/rpc/cra/craRouter'
import { router } from '@app/web/server/rpc/createRouter'

export const appRouter = router({
  cra: craRouter,
  apiClient: apiClientRouter,
  tags: tagsRouter,
  maintenance: maintenanceRouter,
})
// export type definition of API
export type AppRouter = typeof appRouter
