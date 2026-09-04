import { checkSiret } from '@app/web/external-apis/siret/checkSiret'
import { requiredSiretValidation } from '@app/web/libraries/siret'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { z } from 'zod'

export const siretRouter = router({
  checkSiret: protectedProcedure
    .input(z.object({ siret: requiredSiretValidation }))
    .mutation(async ({ input: { siret } }) => checkSiret(siret)),
})
