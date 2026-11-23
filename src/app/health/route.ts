export const dynamic = 'force-dynamic'
export const revalidate = 0

export const GET = () =>
  new Response(JSON.stringify({ status: 'ok' }), {
    headers: { 'Content-Type': 'application/json' },
  })
