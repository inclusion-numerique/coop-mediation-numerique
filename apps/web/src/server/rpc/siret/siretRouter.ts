import { checkSiret } from '@app/web/features/structures/siret/checkSiret'
import { requiredSiretValidation } from '@app/web/features/structures/siret/siretValidation'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { z } from 'zod'

export const siretRouter = router({
  checkSiret: protectedProcedure
    .input(z.object({ siret: requiredSiretValidation }))
    .mutation(async ({ input: { siret } }) => checkSiret(siret)),
})
