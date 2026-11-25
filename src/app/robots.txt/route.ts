import { estMain } from '@/configuration/projet'

export const dynamic = 'force-static'

// Disallow indexing of preview environments
export const GET = () =>
  estMain()
    ? new Response(`User-agent: *
Allow: /
`)
    : new Response(`User-agent: *
Disallow: /
`)
