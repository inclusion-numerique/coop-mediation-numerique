import { getSessionTokenFromNextRequestCookies } from '@app/web/auth/getSessionTokenFromCookies'
import { getSessionUserFromSessionToken } from '@app/web/auth/getSessionUserFromSessionToken'
import {
  classeurDesCoordinations,
  exporterLesActivitesDeCoordination,
  tagsDesCriteres,
} from '@app/web/features/activites/abilities/exporter-les-activites-de-coordination'
import {
  CoordinateurId,
  criteresDesCoordinations,
} from '@app/web/features/activites/domain'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const GET = async (request: NextRequest) => {
  const user = await getSessionUserFromSessionToken(
    getSessionTokenFromNextRequestCookies(request.cookies),
  )
  if (!user?.coordinateur) return new Response('Unauthorized', { status: 401 })

  const recherche = request.nextUrl.searchParams
  const criteres = criteresDesCoordinations({
    du: recherche.get('du') ?? undefined,
    au: recherche.get('au') ?? undefined,
    types: recherche.get('types') ?? undefined,
    tags: recherche.get('tags') ?? undefined,
  })

  const [activites, tags] = await Promise.all([
    exporterLesActivitesDeCoordination({
      coordinateurId: CoordinateurId(user.coordinateur.id),
      criteres,
    }),
    tagsDesCriteres(criteres),
  ])

  const donnees = await classeurDesCoordinations({
    activites,
    criteres,
    tags,
    auteur: user,
  }).xlsx.writeBuffer()

  return new Response(donnees, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="coop-numerique_coordinations_${dateAsIsoDay(new Date())}.xlsx"`,
    },
  })
}
