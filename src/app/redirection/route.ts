import { NextRequest, NextResponse } from 'next/server'

const destinationsAutorisees: ReadonlySet<string> = new Set([
  'https://identite.proconnect.gouv.fr/personal-information',
])

export const GET = async (request: NextRequest) => {
  const url = request.nextUrl.searchParams.get('url')

  return url !== null && destinationsAutorisees.has(url)
    ? NextResponse.redirect(url)
    : NextResponse.json({ error: 'Destination non autorisée' }, { status: 400 })
}
