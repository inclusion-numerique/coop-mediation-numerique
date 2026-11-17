import { getSessionTokenFromNextRequestCookies } from '@app/web/auth/getSessionTokenFromCookies'
import { getSessionUserFromSessionToken } from '@app/web/auth/getSessionUserFromSessionToken'
import {
  classeurDesMembres,
  exporterLesMembres,
} from '@app/web/features/equipe/abilities/exporter-les-membres'
import { estMembreActif } from '@app/web/features/equipe/abilities/lister-les-membres'
import {
  CoordinateurId,
  criteresEquipe,
  MediateurId,
} from '@app/web/features/equipe/domain'
import { gestionnaireDe } from '@app/web/features/equipe/implementation/session'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import type { NextRequest } from 'next/server'

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
    auteur: user,
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
