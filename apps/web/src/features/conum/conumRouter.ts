import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { enforceIsAdmin } from '@app/web/server/rpc/enforceIsAdmin'
import { syncProfiles } from './use-cases/sync-profiles/syncProfiles'
import { updateInfo } from './use-cases/update-info/updateInfo'
import { updateStructureReferent } from './use-cases/update-structure-referent/updateStructureReferent'

export const conumRouter = router({
  syncProfiles: protectedProcedure.mutation(
    async ({ ctx: { user: sessionUser } }) => {
      enforceIsAdmin(sessionUser)
      await syncProfiles()
    },
  ),
  updateInfo: protectedProcedure.mutation(
    async ({ ctx: { user: sessionUser } }) => {
      enforceIsAdmin(sessionUser)
      await updateInfo()
    },
  ),
  updateStructureReferent: protectedProcedure.mutation(
    async ({ ctx: { user: sessionUser } }) => {
      enforceIsAdmin(sessionUser)
      await updateStructureReferent()
    },
  ),
})
