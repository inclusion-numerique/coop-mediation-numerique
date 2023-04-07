import { initTRPC } from '@trpc/server'
import { createContext } from '@stack/web/server/rpc/rpcContext'

const t = initTRPC.context<typeof createContext>().create()

export const appRouter = t.router({
  testReset: t.procedure.mutation(async ({ ctx }) => {
    ctx.req.headers.host
    if (process.env.CI !== 'true') {
      throw new Error('Not allowed to reset state')
    }
  }),
})
// export type definition of API
export type AppRouter = typeof appRouter
