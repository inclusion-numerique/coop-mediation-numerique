import type { NextRequest } from 'next/server'
import { getSessionTokenFromNextRequestCookies } from '@/auth/getSessionTokenFromCookies'
import { getSessionUserFromSessionToken } from '@/auth/getSessionUserFromSessionToken'
import { mediateurCoordonnesEtAnciensIdsFor } from '@/auth/mediateursCoordonnes'
import {
  exporterMesAccompagnements,
  nomsDesFiltresExportes,
} from '@/features/activites/abilities/exporter-mes-accompagnements'
import {
  classeurDesAccompagnements,
  libellesDuClasseur,
} from '@/features/activites/abilities/exporter-mes-accompagnements/ui'
import {
  CoordinateurId,
  criteresDesActivites,
  MediateurId,
} from '@/features/activites/domain'
import { tagsUtilisablesDepuis } from '@/features/activites/implementation/fournisseurs-de-la-saisie'
import { filtresDeLaListe } from '@/features/activites/ui/filtres/filtres-de-la-liste'
import { getInitialBeneficiairesOptionsForSearch } from '@/features/beneficiaire/abilities/rechercher-beneficiaires/ui/get-initial-beneficiaires-options-for-search'
import { conseillerNumeriqueSql } from '@/features/employeuse/server'
import {
  getLieuxDesActivitesOptions,
  getMediateurCommunesAndDepartementsOptions,
} from '@/features/lieux-activite'
import { tagsVisiblesPar } from '@/features/tags/abilities/lire-les-tags-visibles'
import { dateAsIsoDay } from '@/utils/dateAsIsoDay'

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

  const criteres = criteresDesActivites(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  )
  const equipe = mediateurCoordonnesEtAnciensIdsFor(user)
  const demandeur = {
    mediateurId: user.mediateur ? MediateurId(user.mediateur.id) : null,
    coordinateurId: user.coordinateur
      ? CoordinateurId(user.coordinateur.id)
      : null,
    equipe: equipe.map((id) => MediateurId(id)),
  }

  const [exportDes, noms] = await Promise.all([
    exporterMesAccompagnements({
      demandeur,
      criteres,
      conseillersNumeriques: conseillerNumeriqueSql,
    }),
    nomsDesFiltresExportes({
      demandeur,
      criteres,
      lieuxDesActivites: getLieuxDesActivitesOptions,
      communesEtDepartements: getMediateurCommunesAndDepartementsOptions,
      tagsUtilisables: tagsUtilisablesDepuis(tagsVisiblesPar(user)),
      beneficiaires: (ids) =>
        getInitialBeneficiairesOptionsForSearch({
          mediateurId: user.mediateur?.id,
          includeBeneficiaireIds: [...ids],
        }),
    }),
  ])

  const classeur = classeurDesAccompagnements({
    demandeur: user,
    filtres: libellesDuClasseur(
      filtresDeLaListe(criteres),
      noms,
      exportDes.colonnes.source,
    ),
    exportDes,
    fuseau: user.timezone,
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
