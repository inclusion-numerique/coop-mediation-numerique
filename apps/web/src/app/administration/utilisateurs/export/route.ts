import { getSessionTokenFromNextRequestCookies } from '@app/web/auth/getSessionTokenFromCookies'
import { getSessionUserFromSessionToken } from '@app/web/auth/getSessionUserFromSessionToken'
import { optionsDesFiltres } from '@app/web/composition/utilisateurs/options-des-filtres'
import {
  classeurDesUtilisateurs,
  utilisateursAExporter,
} from '@app/web/features/utilisateurs/abilities/exporter-les-utilisateurs'
import { filtresUtilisateurs } from '@app/web/features/utilisateurs/domain'
import { libellesDesFiltres } from '@app/web/features/utilisateurs/ui'
import { toQueryParts } from '@app/web/libs/data-table/toQueryParts'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const GET = async (request: NextRequest) => {
  const auteur = await getSessionUserFromSessionToken(
    getSessionTokenFromNextRequestCookies(request.cookies),
  )

  if (auteur?.role !== 'Admin') return new Response(null, { status: 403 })

  const parametres = Object.fromEntries(request.nextUrl.searchParams.entries())
  const filtres = filtresUtilisateurs(parametres)
  const maintenant = new Date()

  const [utilisateurs, options] = await Promise.all([
    utilisateursAExporter({
      mots: toQueryParts(parametres).filter((mot) => mot !== ''),
      filtres,
      maintenant,
    }),
    optionsDesFiltres(filtres),
  ])

  const classeur = classeurDesUtilisateurs({
    utilisateurs,
    auteur,
    filtres: libellesDesFiltres(filtres, options),
    genereLe: maintenant,
  })

  return new Response(await classeur.xlsx.writeBuffer(), {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="coop-numerique_utilisateurs_${dateAsIsoDay(maintenant)}.xlsx"`,
    },
  })
}
