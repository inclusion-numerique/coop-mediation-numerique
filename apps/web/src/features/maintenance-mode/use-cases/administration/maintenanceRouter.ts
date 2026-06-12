import {
  getMaintenanceHistory,
  getMaintenanceMode,
} from '@app/web/features/maintenance-mode/db/getMaintenanceMode'
import { setMaintenanceMode } from '@app/web/features/maintenance-mode/db/setMaintenanceMode'
import { MaintenanceModeValidation } from '@app/web/features/maintenance-mode/use-cases/administration/MaintenanceModeValidation'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { enforceIsAdmin } from '@app/web/server/rpc/enforceIsAdmin'

export const maintenanceRouter = router({
  status: protectedProcedure.query(() => getMaintenanceMode()),
  history: protectedProcedure.query(({ ctx: { user } }) => {
    enforceIsAdmin(user)

    return getMaintenanceHistory()
  }),
  set: protectedProcedure
    .input(MaintenanceModeValidation)
    .mutation(({ input: { active, message }, ctx: { user } }) => {
      enforceIsAdmin(user)

      return setMaintenanceMode({
        active,
        message: message ?? null,
        updatedBy: user.id,
      })
    }),
})
