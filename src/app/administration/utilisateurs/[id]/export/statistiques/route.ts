import type { NextRequest } from 'next/server'
import { decrireLesActivitesDuPerimetre } from '@/features/activites/abilities/decrire-les-activites-du-perimetre'
import {
  lieuxChoisisDe,
  perimetreDeLUtilisateur,
  rassembler,
  statistiquesDuPerimetre,
} from '@/features/activites/implementations/statistiques'
import { vocabulaireDesActivites } from '@/features/activites/ui/libelles/vocabulaire-des-statistiques.labels'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { getSessionTokenFromNextRequestCookies } from '@/features/authentification/implementations/session/session-token-from-cookies'
import {
  getSessionUserFromId,
  getSessionUserFromSessionToken,
} from '@/features/authentification/implementations/session/session-user-from-session-token'
import { getInitialBeneficiairesOptionsForSearch } from '@/features/beneficiaire/abilities/rechercher-beneficiaires/ui/get-initial-beneficiaires-options-for-search'
import { membresAFiltrerDuDemandeur } from '@/features/equipe/abilities/lister-les-membres-a-filtrer'
import { rendezVousAuxStatutsSql } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites'
import { rdvStatusOptions } from '@/features/rdvsp/ui/statut-rdv'
import { buildStatistiquesWorksheet } from '@/features/statistiques/ui/classeur-des-statistiques'
import { entreeDuClasseur } from '@/features/statistiques/ui/entree-du-classeur'
import { filtresDeLExport } from '@/features/statistiques/ui/export/demande-d-export'
import { donneesDeMesStatistiques } from '@/features/statistiques/ui/mes-statistiques'
import { tagsVisiblesDuProfil } from '@/features/tags/abilities/lire-les-tags-visibles'
import { UtilisateurId } from '@/features/utilisateurs/domain'
import { auteurDeLExport } from '@/features/utilisateurs/ui/auteur-de-l-export'
import { dateAsIsoDay } from '@/libraries/date/dateAsIsoDay'

const sourcesDesStatistiques = {
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

  const filters = filtresDeLExport(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  )
  if (filters === null)
    return new Response('Invalid query params', { status: 400 })

  const user = await getSessionUserFromId(utilisateurId)

  const workbook = buildStatistiquesWorksheet(
    entreeDuClasseur({
      statistiques: await donneesDeMesStatistiques(
        { user, profil: profilDeLaSession(user), activitesFilters: filters },
        sourcesDesStatistiques,
      ),
      filters,
      auteur: auteurDeLExport(administrateur),
      fuseau: user.timezone,
    }),
  )

  return new Response(await workbook.xlsx.writeBuffer(), {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="coop-numerique_statistiques_${dateAsIsoDay(new Date())}.xlsx"`,
    },
  })
}
