import { getMediateurFromDataspaceApi } from '@app/web/external-apis/dataspace/dataspaceApiClient'
import { DataspaceSearchValidation } from '@app/web/features/dataspace/use-cases/administration/DataspaceSearchValidation'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { enforceIsAdmin } from '@app/web/server/rpc/enforceIsAdmin'

export const dataspaceAdminRouter = router({
  getMediateur: protectedProcedure
    .input(DataspaceSearchValidation)
    .mutation(async ({ input: { email }, ctx: { user } }) => {
      enforceIsAdmin(user)

      const result = await getMediateurFromDataspaceApi({ email })

      return result
    }),
})
