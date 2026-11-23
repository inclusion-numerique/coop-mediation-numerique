import { notFound } from 'next/navigation'
import { NextRequest } from 'next/server'
import { z } from 'zod'
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
import { getSessionUserFromId } from '@/features/authentification/implementations/session/session-user-from-session-token'
import { membresAFiltrerDuDemandeur } from '@/features/equipe/abilities/lister-les-membres-a-filtrer/implementations/prisma/membres-a-filtrer-du-demandeur.query'
import { resoudreUnLienDePartage } from '@/features/mediateurs/abilities/resoudre-un-lien-de-partage/implementations/prisma/resoudre-un-lien-de-partage.query'
import { rendezVousAuxStatutsSql } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites/implementations/prisma/rdvs-des-activites.query'
import { rdvStatusOptions } from '@/features/rdvsp/ui/presenters/statut-rdv'
import {
  type ActivitesFilters,
  ActivitesFilterValidations,
} from '@/features/statistiques/domain/filtres-des-activites'
import { utilisateurDuPartage } from '@/features/statistiques/domain/utilisateur-du-partage'
import { buildStatistiquesWorksheet } from '@/features/statistiques/implementations/excel/classeur-des-statistiques'
import { entreeDuClasseur } from '@/features/statistiques/ui/presenters/entree-du-classeur'
import { donneesDeMesStatistiques } from '@/features/statistiques/ui/presenters/mes-statistiques'
import { tagsVisiblesDuProfil } from '@/features/tags/abilities/lire-les-tags-visibles/implementations/session/tags-visibles-du-profil'
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

const sourcesDeMesStatistiques = {
  perimetreDe: perimetreDeLUtilisateur,
  lancer: statistiquesDuPerimetre(
    statistiquesDesActivites.lancer,
    rendezVousAuxStatutsSql,
  ),
  rassembler: statistiquesDesActivites.rassembler,
  lieuxChoisis: lieuxChoisisDe,
  tagsVisibles: tagsVisiblesDuProfil,
  beneficiaires: async () => [],
  membres: membresAFiltrerDuDemandeur,
  activitesDuPerimetre: decrireLesActivitesDuPerimetre,
  vocabulaire: {
    ...vocabulaireDesActivites,
    statutsDeRendezVous: rdvStatusOptions,
  },
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const ExportActivitesValidation = z
  .object(ActivitesFilterValidations)
  .omit({ beneficiaires: true })

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> },
) => {
  const shareId = (await params).shareId
  const partage = await resoudreUnLienDePartage(shareId)
  if (!partage.success) return notFound()

  const parsedQueryParams = ExportActivitesValidation.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  )

  if (parsedQueryParams.error) {
    return new Response('Invalid query params', { status: 400 })
  }

  const filters: ActivitesFilters = parsedQueryParams.data

  const user = utilisateurDuPartage(
    partage.data.proprietaire,
    await getSessionUserFromId(partage.data.utilisateurId),
  )

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
