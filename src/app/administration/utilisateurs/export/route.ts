import type { NextRequest } from 'next/server'
import { getSessionTokenFromNextRequestCookies } from '@/features/authentification/implementation/session/getSessionTokenFromCookies'
import { getSessionUserFromSessionToken } from '@/features/authentification/implementation/session/getSessionUserFromSessionToken'
import { nomDeLEmployeuse } from '@/features/employeuse/server'
import {
  getCommunesAndDepartementsOptions,
  getLieuxActiviteOptions,
} from '@/features/lieux-activite/abilities/lister-les-options-de-lieux'
import { auteurDeLExport } from '@/features/utilisateurs'
import {
  classeurDesUtilisateurs,
  utilisateursAExporter,
} from '@/features/utilisateurs/abilities/exporter-les-utilisateurs'
import { optionsDesFiltres } from '@/features/utilisateurs/abilities/lister-les-utilisateurs'
import { filtresUtilisateurs } from '@/features/utilisateurs/domain'
import { libellesDesFiltres } from '@/features/utilisateurs/ui'
import { toQueryParts } from '@/libraries/data-table/search/toQueryParts'
import { dateAsIsoDay } from '@/libraries/date/dateAsIsoDay'

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
    optionsDesFiltres(filtres, {
      communesEtDepartements: getCommunesAndDepartementsOptions,
      lieux: getLieuxActiviteOptions,
      nomDeLEmployeuse,
    }),
  ])

  const classeur = classeurDesUtilisateurs({
    utilisateurs,
    auteur: auteurDeLExport(auteur),
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
