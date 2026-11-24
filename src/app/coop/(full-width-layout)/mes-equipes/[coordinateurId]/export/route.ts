import type { NextRequest } from 'next/server'
import { utilisateurDuJetonDeSession } from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.query'
import { jetonDeSessionDesCookies } from '@/features/authentification/implementations/session/session-token-from-cookies.query'
import { classeurDesMembresAvec } from '@/features/equipe/abilities/exporter-les-membres/implementations/excel/classeur-equipe.classeur'
import { exporterLesMembres } from '@/features/equipe/abilities/exporter-les-membres/implementations/prisma/exporter-les-membres.query'
import { membreExporte } from '@/features/equipe/abilities/exporter-les-membres/ui/presenters/membre-exporte.presenter'
import { estMembreActif } from '@/features/equipe/abilities/lister-les-membres/implementations/prisma/lister-les-membres.query'
import { CoordinateurId, MediateurId } from '@/features/equipe/domain'
import { gestionnaireDe } from '@/features/equipe/implementations/session'
import { criteresDeLEquipe } from '@/features/equipe/ui/filtres/equipe.filtre'
import { auteurDeLExport } from '@/features/utilisateurs/ui/presenters/auteur-de-l-export.presenter'
import { dateAsIsoDay } from '@/libraries/date/dateAsIsoDay'

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ coordinateurId: string }> },
) => {
  const coordinateurId = CoordinateurId.safe((await params).coordinateurId)
  if (coordinateurId === null) return new Response('Not found', { status: 404 })

  const user = await utilisateurDuJetonDeSession(
    jetonDeSessionDesCookies(request.cookies),
  )
  if (!user) return new Response('Unauthorized', { status: 401 })

  const criteres = criteresDeLEquipe(new URL(request.url).searchParams)

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

  const donnees = await classeurDesMembresAvec(membreExporte)({
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
