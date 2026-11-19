import type { NextRequest } from 'next/server'
import { classeurDeMesCoordinations } from '@/features/activites/abilities/exporter-les-activites-de-coordination'
import { profilDeLaSession } from '@/features/authentification'
import { getSessionTokenFromNextRequestCookies } from '@/features/authentification/implementation/session/getSessionTokenFromCookies'
import { getSessionUserFromSessionToken } from '@/features/authentification/implementation/session/getSessionUserFromSessionToken'
import { tagsVisiblesPar } from '@/features/tags/abilities/lire-les-tags-visibles'
import { acteurDe } from '@/features/tags/domain'
import { dateAsIsoDay } from '@/libraries/date/dateAsIsoDay'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const GET = async (request: NextRequest) => {
  const user = await getSessionUserFromSessionToken(
    getSessionTokenFromNextRequestCookies(request.cookies),
  )
  if (!user?.coordinateur) return new Response('Unauthorized', { status: 401 })

  const classeur = await classeurDeMesCoordinations({
    recherche: request.nextUrl.searchParams,
    coordinateurId: user.coordinateur.id,
    auteur: user,
    fuseau: user.timezone,
    tagsVisibles: tagsVisiblesPar(acteurDe(profilDeLaSession(user))),
  })

  const donnees = await classeur.xlsx.writeBuffer()

  return new Response(donnees, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="coop-numerique_coordinations_${dateAsIsoDay(new Date())}.xlsx"`,
    },
  })
}
