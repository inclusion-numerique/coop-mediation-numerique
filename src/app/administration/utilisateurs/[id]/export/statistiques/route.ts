import type { NextRequest } from 'next/server'
import { totauxDesAccompagnements } from '@/features/activites/abilities/compter-les-accompagnements/implementations/totaux-des-accompagnements.binding'
import { accompagnementsParCommune } from '@/features/activites/abilities/compter-les-accompagnements-par-commune/implementations/accompagnements-par-commune.binding'
import { accompagnementsParLieu } from '@/features/activites/abilities/compter-les-accompagnements-par-lieu/implementations/accompagnements-par-lieu.binding'
import { accompagnementsParPeriode } from '@/features/activites/abilities/compter-les-accompagnements-par-periode/implementations/accompagnements-par-periode.binding'
import { personnesParCommune } from '@/features/activites/abilities/compter-les-personnes-accompagnees-par-commune/implementations/personnes-par-commune.binding'
import { decrireLesActivitesDuPerimetre } from '@/features/activites/abilities/decrire-les-activites-du-perimetre/implementations/prisma/activites-du-perimetre.query'
import { profilDesPersonnesAccompagnees } from '@/features/activites/abilities/decrire-les-personnes-accompagnees/implementations/profil-des-personnes-accompagnees.binding'
import { lieuxChoisisDe } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/implementations/lieux-choisis.binding'
import { repartitionDesAccompagnements } from '@/features/activites/abilities/repartir-les-accompagnements/implementations/repartition-des-accompagnements.binding'
import { accompagnementsParTag } from '@/features/activites/abilities/repartir-les-accompagnements-par-tag/implementations/accompagnements-par-tag.binding'
import { presenceDeCrasV1 } from '@/features/activites/abilities/verifier-la-presence-de-cras-v1/implementations/presence-de-cras-v1.binding'
import { perimetreDeLUtilisateur } from '@/features/activites/implementations/session/perimetre'
import { statistiquesDuPerimetre } from '@/features/activites/implementations/statistiques-du-perimetre.binding'
import { statistiquesAvec } from '@/features/activites/implementations/statistiques-en-cours.binding'
import { vocabulaireDesActivites } from '@/features/activites/ui/labels/libelles/vocabulaire-des-statistiques.labels'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { getSessionTokenFromNextRequestCookies } from '@/features/authentification/implementations/session/session-token-from-cookies'
import {
  getSessionUserFromId,
  getSessionUserFromSessionToken,
} from '@/features/authentification/implementations/session/session-user-from-session-token'
import { getInitialBeneficiairesOptionsForSearch } from '@/features/beneficiaire/abilities/rechercher-beneficiaires/ui/presenters/get-initial-beneficiaires-options-for-search'
import { membresAFiltrerDuDemandeur } from '@/features/equipe/abilities/lister-les-membres-a-filtrer/implementations/prisma/membres-a-filtrer-du-demandeur.query'
import { rendezVousAuxStatutsSql } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites/implementations/prisma/rdvs-des-activites.query'
import { rdvStatusOptions } from '@/features/rdvsp/ui/presenters/statut-rdv'
import { buildStatistiquesWorksheet } from '@/features/statistiques/implementations/excel/classeur-des-statistiques'
import { filtresDeLExport } from '@/features/statistiques/ui/presenters/demande-d-export'
import { entreeDuClasseur } from '@/features/statistiques/ui/presenters/entree-du-classeur'
import { donneesDeMesStatistiques } from '@/features/statistiques/ui/presenters/mes-statistiques'
import { tagsVisiblesDuProfil } from '@/features/tags/abilities/lire-les-tags-visibles/implementations/session/tags-visibles-du-profil'
import { UtilisateurId } from '@/features/utilisateurs/domain'
import { auteurDeLExport } from '@/features/utilisateurs/ui/presenters/auteur-de-l-export'
import { dateAsIsoDay } from '@/libraries/date/dateAsIsoDay'

const statistiquesDesActivites = statistiquesAvec({
  totalCounts: totauxDesAccompagnements,
  periode: accompagnementsParPeriode,
  repartition: repartitionDesAccompagnements,
  tags: accompagnementsParTag,
  structures: accompagnementsParLieu,
  communes: accompagnementsParCommune,
  profil: profilDesPersonnesAccompagnees,
  residences: personnesParCommune,
  hasCrasV1: presenceDeCrasV1,
})

const sourcesDesStatistiques = {
  perimetreDe: perimetreDeLUtilisateur,
  lancer: statistiquesDuPerimetre(
    statistiquesDesActivites.lancer,
    rendezVousAuxStatutsSql,
  ),
  rassembler: statistiquesDesActivites.rassembler,
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
