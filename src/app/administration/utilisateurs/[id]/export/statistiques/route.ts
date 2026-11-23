import type { NextRequest } from 'next/server'
import { decrireLesActivitesDuPerimetre } from '@/features/activites/abilities/decrire-les-activites-du-perimetre'
import {
  lieuxChoisisDe,
  perimetreDeLUtilisateur,
  rassembler,
  statistiquesDuPerimetre,
} from '@/features/activites/implementation/statistiques'
import { vocabulaireDesActivites } from '@/features/activites/ui/libelles/vocabulaire-des-statistiques'
import { profilDeLaSession } from '@/features/authentification'
import { getSessionTokenFromNextRequestCookies } from '@/features/authentification/implementation/session/getSessionTokenFromCookies'
import {
  getSessionUserFromId,
  getSessionUserFromSessionToken,
} from '@/features/authentification/implementation/session/getSessionUserFromSessionToken'
import { getInitialBeneficiairesOptionsForSearch } from '@/features/beneficiaire/abilities/rechercher-beneficiaires/ui/get-initial-beneficiaires-options-for-search'
import { membresAFiltrerDuDemandeur } from '@/features/equipe/abilities/lister-les-membres-a-filtrer'
import { rendezVousAuxStatutsSql } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites'
import { rdvStatusOptions } from '@/features/rdvsp/ui/rdv-status'
import { donneesDeMesStatistiques } from '@/features/statistiques/implementation/mes-statistiques'
import { filtresDeLExport } from '@/features/statistiques/ui/export/demande-d-export'
import { buildStatistiquesWorksheet } from '@/features/statistiques/ui/tableur/classeur-des-statistiques'
import { entreeDuClasseur } from '@/features/statistiques/ui/tableur/entree-du-classeur'
import { tagsVisiblesDuProfil } from '@/features/tags/abilities/lire-les-tags-visibles'
import { auteurDeLExport } from '@/features/utilisateurs'
import { UtilisateurId } from '@/features/utilisateurs/domain'
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
