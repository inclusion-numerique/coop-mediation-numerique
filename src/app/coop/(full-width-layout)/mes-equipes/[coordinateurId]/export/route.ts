import type { NextRequest } from 'next/server'
import { getSessionTokenFromNextRequestCookies } from '@/features/authentification/implementation/session/getSessionTokenFromCookies'
import { getSessionUserFromSessionToken } from '@/features/authentification/implementation/session/getSessionUserFromSessionToken'
import {
  classeurDesMembres,
  exporterLesMembres,
} from '@/features/equipe/abilities/exporter-les-membres'
import { estMembreActif } from '@/features/equipe/abilities/lister-les-membres'
import {
  CoordinateurId,
  criteresEquipe,
  MediateurId,
} from '@/features/equipe/domain'
import { gestionnaireDe } from '@/features/equipe/implementation/session'
import { auteurDeLExport } from '@/features/utilisateurs'
import { dateAsIsoDay } from '@/libraries/date/dateAsIsoDay'

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ coordinateurId: string }> },
) => {
  const coordinateurId = CoordinateurId.safe((await params).coordinateurId)
  if (coordinateurId === null) return new Response('Not found', { status: 404 })

  const user = await getSessionUserFromSessionToken(
    getSessionTokenFromNextRequestCookies(request.cookies),
  )
  if (!user) return new Response('Unauthorized', { status: 401 })

  const recherche = new URL(request.url).searchParams
  const criteres = criteresEquipe({
    recherche: recherche.get('recherche') ?? undefined,
    statut: recherche.get('statut') ?? undefined,
    role: recherche.get('role') ?? undefined,
    tri: recherche.get('tri') ?? undefined,
    ordre: recherche.get('ordre') ?? undefined,
  })

  const membres = await exporterLesMembres({
    coordinateurId,
    lecteur: {
      gestionnaire: gestionnaireDe(user),
      membreActifDeLEquipe: await estMembreActif({
        mediateurId:
          user.mediateur == null ? null : MediateurId(user.mediateur.id),
        coordinateurId,
      }),
    },
    criteres,
  })

  if (!membres.success) return new Response('Forbidden', { status: 403 })

  const donnees = await classeurDesMembres({
    membres: membres.data,
    criteres,
    auteur: auteurDeLExport(user),
  }).xlsx.writeBuffer()

  return new Response(donnees, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="coop-numerique_export-equipe_${dateAsIsoDay(new Date())}.xlsx"`,
    },
  })
}
