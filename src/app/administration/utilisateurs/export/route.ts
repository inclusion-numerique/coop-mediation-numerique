import type { NextRequest } from 'next/server'
import { getSessionTokenFromNextRequestCookies } from '@/features/authentification/implementations/session/getSessionTokenFromCookies'
import { getSessionUserFromSessionToken } from '@/features/authentification/implementations/session/getSessionUserFromSessionToken'
import { nomDeLEmployeuse } from '@/features/employeuse/abilities/consulter-employeuse/implementations'
import { communesDesEmployeuses } from '@/features/employeuse/abilities/rechercher-employeuse/implementations'
import { lieuxChoisis } from '@/features/lieux-activite/abilities/lister-les-options-de-lieux'
import {
  classeurDesUtilisateurs,
  utilisateursAExporter,
} from '@/features/utilisateurs/abilities/exporter-les-utilisateurs'
import { optionsDesFiltres } from '@/features/utilisateurs/abilities/lister-les-utilisateurs'
import { filtresUtilisateurs } from '@/features/utilisateurs/domain'
import { libellesDesFiltres } from '@/features/utilisateurs/ui'
import { auteurDeLExport } from '@/features/utilisateurs/ui/tableur/auteur-de-l-export'
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
      communes: communesDesEmployeuses,
      lieux: lieuxChoisis,
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
