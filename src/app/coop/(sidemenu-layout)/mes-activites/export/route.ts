import type { NextRequest } from 'next/server'
import { classeurDeMesAccompagnements } from '@/features/activites/abilities/exporter-mes-accompagnements'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { getSessionTokenFromNextRequestCookies } from '@/features/authentification/implementations/session/getSessionTokenFromCookies'
import { getSessionUserFromSessionToken } from '@/features/authentification/implementations/session/getSessionUserFromSessionToken'
import { getInitialBeneficiairesOptionsForSearch } from '@/features/beneficiaire/abilities/rechercher-beneficiaires/ui/get-initial-beneficiaires-options-for-search'
import { mediateurCoordonnesEtAnciensIdsFor } from '@/features/equipe/domain/mediateurs-coordonnes'
import {
  getLieuxDesActivitesOptions,
  getMediateurCommunesAndDepartementsOptions,
} from '@/features/lieux-activite/abilities/lister-les-options-de-lieux'
import { tagsVisiblesPar } from '@/features/tags/abilities/lire-les-tags-visibles'
import { acteurDe } from '@/features/tags/domain'
import { auteurDeLExport } from '@/features/utilisateurs/ui/tableur/auteur-de-l-export'
import { dateAsIsoDay } from '@/libraries/date/dateAsIsoDay'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 300

export const GET = async (request: NextRequest) => {
  const user = await getSessionUserFromSessionToken(
    getSessionTokenFromNextRequestCookies(request.cookies),
  )

  if (!user?.mediateur && !user?.coordinateur) {
    return new Response('Unauthorized', { status: 401 })
  }

  const classeur = await classeurDeMesAccompagnements({
    parametres: Object.fromEntries(request.nextUrl.searchParams.entries()),
    demandeur: {
      mediateurId: user.mediateur?.id ?? null,
      coordinateurId: user.coordinateur?.id ?? null,
      equipe: mediateurCoordonnesEtAnciensIdsFor(user),
    },
    auteur: auteurDeLExport(user),
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

  const data = await classeur.xlsx.writeBuffer()
  const filename = `coop-numerique_accompagnements_${dateAsIsoDay(new Date())}.xlsx`

  return new Response(data, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
