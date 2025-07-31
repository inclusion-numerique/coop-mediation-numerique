import 'client-only'
import type { AppRouter } from '@app/web/server/rpc/appRouter'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import superjson from 'superjson'

export const trpc = createTRPCReact<AppRouter>()

export const vanillaTrpc = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: '/api/trpc', transformer: superjson })],
})
