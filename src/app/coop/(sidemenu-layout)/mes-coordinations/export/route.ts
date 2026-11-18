import type { NextRequest } from 'next/server'
import { getSessionTokenFromNextRequestCookies } from '@/auth/getSessionTokenFromCookies'
import { getSessionUserFromSessionToken } from '@/auth/getSessionUserFromSessionToken'
import {
  classeurDesCoordinations,
  exporterLesActivitesDeCoordination,
  tagsRappeles,
} from '@/features/activites/abilities/exporter-les-activites-de-coordination'
import {
  CoordinateurId,
  criteresDesCoordinations,
} from '@/features/activites/domain'
import { tagsUtilisablesDepuis } from '@/features/activites/implementation/fournisseurs-de-la-saisie'
import { tagsVisiblesPar } from '@/features/tags/abilities/lire-les-tags-visibles'
import { dateAsIsoDay } from '@/libraries/date/dateAsIsoDay'

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
    tagsRappeles({
      criteres,
      tagsUtilisables: tagsUtilisablesDepuis(tagsVisiblesPar(user)),
    }),
  ])

  const donnees = await classeurDesCoordinations({
    activites,
    criteres,
    tags,
    auteur: user,
    fuseau: user.timezone,
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
