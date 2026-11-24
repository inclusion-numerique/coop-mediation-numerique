import type { NextRequest } from 'next/server'
import { classeurDeMesCoordinations } from '@/features/activites/abilities/exporter-les-activites-de-coordination/implementations/excel/classeur-de-mes-coordinations'
import { lignesDesCoordinations } from '@/features/activites/abilities/exporter-les-activites-de-coordination/ui/presenters/lignes-des-coordinations.presenter'
import { parametresDeLaRecherche } from '@/features/activites/abilities/exporter-les-activites-de-coordination/ui/presenters/parametres-de-la-recherche.search-params'
import { criteresDesCoordinations } from '@/features/activites/domain'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { getSessionUserFromSessionToken } from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.query'
import { getSessionTokenFromNextRequestCookies } from '@/features/authentification/implementations/session/session-token-from-cookies'
import { tagsVisiblesPar } from '@/features/tags/abilities/lire-les-tags-visibles/implementations/session/tags-visibles-par'
import { acteurDe } from '@/features/tags/domain'
import { auteurDeLExport } from '@/features/utilisateurs/ui/presenters/auteur-de-l-export.presenter'
import { dateAsIsoDay } from '@/libraries/date/dateAsIsoDay'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const GET = async (request: NextRequest) => {
  const user = await getSessionUserFromSessionToken(
    getSessionTokenFromNextRequestCookies(request.cookies),
  )
  if (!user?.coordinateur) return new Response('Unauthorized', { status: 401 })

  const classeur = await classeurDeMesCoordinations({
    criteres: criteresDesCoordinations(
      parametresDeLaRecherche(request.nextUrl.searchParams),
    ),
    coordinateurId: user.coordinateur.id,
    auteur: auteurDeLExport(user),
    fuseau: user.timezone,
    tagsVisibles: tagsVisiblesPar(acteurDe(profilDeLaSession(user))),
    presenter: lignesDesCoordinations,
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
