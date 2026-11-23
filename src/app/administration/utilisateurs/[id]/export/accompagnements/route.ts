import type { NextRequest } from 'next/server'
import { classeurDeMesAccompagnements } from '@/features/activites/abilities/exporter-mes-accompagnements'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { getSessionTokenFromNextRequestCookies } from '@/features/authentification/implementations/session/getSessionTokenFromCookies'
import {
  getSessionUserFromId,
  getSessionUserFromSessionToken,
} from '@/features/authentification/implementations/session/getSessionUserFromSessionToken'
import { getInitialBeneficiairesOptionsForSearch } from '@/features/beneficiaire/abilities/rechercher-beneficiaires/ui/get-initial-beneficiaires-options-for-search'
import { mediateurCoordonnesEtAnciensIdsFor } from '@/features/equipe/domain/mediateursCoordonnes'
import {
  getLieuxDesActivitesOptions,
  getMediateurCommunesAndDepartementsOptions,
} from '@/features/lieux-activite/abilities/lister-les-options-de-lieux'
import { tagsVisiblesPar } from '@/features/tags/abilities/lire-les-tags-visibles'
import { acteurDe } from '@/features/tags/domain'
import { UtilisateurId } from '@/features/utilisateurs/domain'
import { auteurDeLExport } from '@/features/utilisateurs/ui/tableur/auteur-de-l-export'
import { dateAsIsoDay } from '@/libraries/date/dateAsIsoDay'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 300

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const administrateur = await getSessionUserFromSessionToken(
    getSessionTokenFromNextRequestCookies(request.cookies),
  )

  if (!administrateur) return new Response('Unauthorized', { status: 401 })
  if (administrateur.role !== 'Admin')
    return new Response('Forbidden', { status: 403 })

  const utilisateurId = UtilisateurId.safe((await params).id)
  if (utilisateurId === null) return new Response('Not found', { status: 404 })

  const user = await getSessionUserFromId(utilisateurId)

  const classeur = await classeurDeMesAccompagnements({
    parametres: Object.fromEntries(request.nextUrl.searchParams.entries()),
    demandeur: {
      mediateurId: user.mediateur?.id ?? null,
      coordinateurId: user.coordinateur?.id ?? null,
      equipe: mediateurCoordonnesEtAnciensIdsFor(user),
    },
    auteur: auteurDeLExport(administrateur),
    fuseau: user.timezone,
    fournisseurs: {
      lieuxDesActivites: getLieuxDesActivitesOptions,
      communesEtDepartements: getMediateurCommunesAndDepartementsOptions,
      tagsVisibles: tagsVisiblesPar(acteurDe(profilDeLaSession(user))),
      beneficiaires: (ids) =>
        getInitialBeneficiairesOptionsForSearch({
          mediateurId: user.mediateur?.id,
          includeBeneficiaireIds: [...ids],
        }),
    },
  })

  return new Response(await classeur.xlsx.writeBuffer(), {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="coop-numerique_accompagnements_${dateAsIsoDay(new Date())}.xlsx"`,
    },
  })
}
