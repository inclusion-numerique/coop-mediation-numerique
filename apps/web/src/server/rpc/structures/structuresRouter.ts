import { searchStructureEmployeuseCombined } from '@app/web/features/employeuse/server'
import { searchStructuresEmployeuses } from '@app/web/features/structures/getStructuresEmployeusesOptions'
import { mediateurCoordonnesIdsFor } from '@app/web/mediateurs/mediateurCoordonnesIdsFor'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { searchLieuActiviteCombined } from '@app/web/structure/searchLieuActiviteCombined'
import { searchLieuInclusion } from '@app/web/structure/searchLieuInclusion'
import { searchStructureCartographieNationale } from '@app/web/structure/searchStructureCartographieNationale'
import { z } from 'zod'

export const structuresRouter = router({
  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(({ input: { query } }) => searchLieuInclusion(query)),

  searchCombined: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(({ input: { query } }) => searchStructureEmployeuseCombined(query)),

  searchCartographieNationale: protectedProcedure
    .input(
      z.object({ query: z.string(), except: z.array(z.string()).nullish() }),
    )
    .query(({ input: { query, except } }) =>
      searchStructureCartographieNationale(query, {
        except: except ?? undefined,
      }),
    ),

  searchLieuActiviteCombined: protectedProcedure
    .input(
      z.object({ query: z.string(), except: z.array(z.string()).nullish() }),
    )
    .query(({ input: { query, except } }) =>
      searchLieuActiviteCombined(query, {
        except: except ?? undefined,
      }),
    ),

  searchStructuresEmployeuses: protectedProcedure
    .input(
      z.object({
        query: z.string(),
        excludeIds: z.array(z.string().uuid()).optional(),
      }),
    )
    .query(({ input: { query, excludeIds }, ctx: { user } }) => {
      const mediateurIds = [
        ...(user.mediateur?.id ? [user.mediateur.id] : []),
        ...mediateurCoordonnesIdsFor(user),
      ]
      return searchStructuresEmployeuses({ query, mediateurIds, excludeIds })
    }),
})
