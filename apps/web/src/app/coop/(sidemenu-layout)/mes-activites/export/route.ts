import { getSessionTokenFromNextRequestCookies } from '@app/web/auth/getSessionTokenFromCookies'
import { getSessionUserFromSessionToken } from '@app/web/auth/getSessionUserFromSessionToken'
import { mediateurCoordonnesEtAnciensIdsFor } from '@app/web/auth/mediateursCoordonnes'
import { getFiltersOptionsForMediateur } from '@app/web/components/filters/getFiltersOptionsForMediateur'
import { exporterMesAccompagnements } from '@app/web/features/activites/abilities/exporter-mes-accompagnements'
import { classeurDesAccompagnements } from '@app/web/features/activites/abilities/exporter-mes-accompagnements/ui/classeur-des-accompagnements'
import {
  CoordinateurId,
  criteresDesActivites,
  MediateurId,
} from '@app/web/features/activites/domain'
import { filtresDeLaListe } from '@app/web/features/activites/ui/filtres/filtres-de-la-liste'
import { generateActivitesFiltersLabels } from '@app/web/features/activites/ui/filtres/libelles-des-filtres'
import { optionsDesSources } from '@app/web/features/activites/ui/libelles/source-de-l-activite'
import { conseillerNumeriqueSql } from '@app/web/features/employeuse/server'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import type { NextRequest } from 'next/server'

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

  const [exportDes, options] = await Promise.all([
    exporterMesAccompagnements({
      demandeur: {
        mediateurId: user.mediateur ? MediateurId(user.mediateur.id) : null,
        coordinateurId: user.coordinateur
          ? CoordinateurId(user.coordinateur.id)
          : null,
        equipe: equipe.map((id) => MediateurId(id)),
      },
      criteres,
      conseillersNumeriques: conseillerNumeriqueSql,
    }),
    getFiltersOptionsForMediateur({
      user,
      mediateurCoordonnesIds: equipe,
      includeBeneficiaireIds: [...criteres.beneficiaires],
    }),
  ])

  const classeur = classeurDesAccompagnements({
    demandeur: user,
    filtres: generateActivitesFiltersLabels(filtresDeLaListe(criteres), {
      beneficiairesOptions: options.initialBeneficiairesOptions.map(
        ({ label, value }) => ({
          label,
          value: value?.id ? { id: value.id } : null,
        }),
      ),
      mediateursOptions: options.initialMediateursOptions,
      structuresEmployeusesOptions: options.structuresEmployeusesOptions,
      communesOptions: options.communesOptions,
      departementsOptions: options.departementsOptions,
      lieuxActiviteOptions: options.lieuxActiviteOptions,
      tagsOptions: options.tagsOptions,
      optionsDesSources: [...optionsDesSources],
    }),
    exportDes,
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
