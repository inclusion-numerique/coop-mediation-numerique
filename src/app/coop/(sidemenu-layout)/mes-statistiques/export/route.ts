import { NextRequest } from 'next/server'
import { decrireLesActivitesDuPerimetre } from '@/features/activites/abilities/decrire-les-activites-du-perimetre/implementations/prisma/activites-du-perimetre.query'
import {
  lieuxChoisisDe,
  perimetreDeLUtilisateur,
  rassembler,
  statistiquesDuPerimetre,
} from '@/features/activites/implementations/statistiques'
import { vocabulaireDesActivites } from '@/features/activites/ui/libelles/vocabulaire-des-statistiques.labels'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { getSessionTokenFromNextRequestCookies } from '@/features/authentification/implementations/session/session-token-from-cookies'
import { getSessionUserFromSessionToken } from '@/features/authentification/implementations/session/session-user-from-session-token'
import { getInitialBeneficiairesOptionsForSearch } from '@/features/beneficiaire/abilities/rechercher-beneficiaires/ui/get-initial-beneficiaires-options-for-search'
import { membresAFiltrerDuDemandeur } from '@/features/equipe/abilities/lister-les-membres-a-filtrer/implementations/membres-a-filtrer-du-demandeur'
import { rendezVousAuxStatutsSql } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites/implementations/prisma/rdvs-des-activites.query'
import { rdvStatusOptions } from '@/features/rdvsp/ui/statut-rdv'
import { buildStatistiquesWorksheet } from '@/features/statistiques/ui/classeur-des-statistiques'
import { entreeDuClasseur } from '@/features/statistiques/ui/entree-du-classeur'
import {
  exportInterdit,
  filtresDeLExport,
} from '@/features/statistiques/ui/export/demande-d-export'
import { donneesDeMesStatistiques } from '@/features/statistiques/ui/mes-statistiques'
import { tagsVisiblesDuProfil } from '@/features/tags/abilities/lire-les-tags-visibles/implementations/session/tags-visibles-du-profil'
import { auteurDeLExport } from '@/features/utilisateurs/ui/auteur-de-l-export'
import { dateAsIsoDay } from '@/libraries/date/dateAsIsoDay'

const sourcesDeMesStatistiques = {
  perimetreDe: perimetreDeLUtilisateur,
  lancer: statistiquesDuPerimetre(rendezVousAuxStatutsSql),
  rassembler,
  lieuxChoisis: lieuxChoisisDe,
  tagsVisibles: tagsVisiblesDuProfil,
  beneficiaires: getInitialBeneficiairesOptionsForSearch,
  membres: membresAFiltrerDuDemandeur,
  activitesDuPerimetre: decrireLesActivitesDuPerimetre,
  vocabulaire: {
    ...vocabulaireDesActivites,
    statutsDeRendezVous: rdvStatusOptions,
  },
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const GET = async (request: NextRequest) => {
  const sessionToken = getSessionTokenFromNextRequestCookies(request.cookies)
  const user = await getSessionUserFromSessionToken(sessionToken)

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (!user.mediateur && !user.coordinateur) {
    return new Response('Forbidden', { status: 403 })
  }

  const filters = filtresDeLExport(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  )

  if (filters === null) {
    return new Response('Invalid query params', { status: 400 })
  }

  if (exportInterdit(user, filters.mediateurs)) {
    return new Response('Cannot export for another mediateur', { status: 403 })
  }

  const statistiquesWorksheetInput = entreeDuClasseur({
    statistiques: await donneesDeMesStatistiques(
      { user, profil: profilDeLaSession(user), activitesFilters: filters },
      sourcesDeMesStatistiques,
    ),
    filters,
    auteur: auteurDeLExport(user),
    fuseau: user.timezone,
  })

  const workbook = buildStatistiquesWorksheet(statistiquesWorksheetInput)

  const data = await workbook.xlsx.writeBuffer()
  const filename = `coop-numerique_statistiques_${dateAsIsoDay(
    new Date(),
  )}.xlsx`

  return new Response(data, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
