import { notFound } from 'next/navigation'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { decrireLesActivitesDuPerimetre } from '@/features/activites/abilities/decrire-les-activites-du-perimetre'
import {
  lieuxChoisisDe,
  perimetreDeLUtilisateur,
  rassembler,
  statistiquesDuPerimetre,
} from '@/features/activites/implementations/statistiques'
import { vocabulaireDesActivites } from '@/features/activites/ui/libelles/vocabulaire-des-statistiques.labels'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { getSessionUserFromId } from '@/features/authentification/implementations/session/session-user-from-session-token'
import { membresAFiltrerDuDemandeur } from '@/features/equipe/abilities/lister-les-membres-a-filtrer'
import { resoudreUnLienDePartage } from '@/features/mediateurs/abilities/resoudre-un-lien-de-partage'
import { rendezVousAuxStatutsSql } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites'
import { rdvStatusOptions } from '@/features/rdvsp/ui/statut-rdv'
import { utilisateurDuPartage } from '@/features/statistiques/domain/utilisateur-du-partage'
import { buildStatistiquesWorksheet } from '@/features/statistiques/ui/classeur-des-statistiques'
import { entreeDuClasseur } from '@/features/statistiques/ui/entree-du-classeur'
import {
  type ActivitesFilters,
  ActivitesFilterValidations,
} from '@/features/statistiques/ui/filtres/barre/parametres-de-la-barre'
import { donneesDeMesStatistiques } from '@/features/statistiques/ui/mes-statistiques'
import { tagsVisiblesDuProfil } from '@/features/tags/abilities/lire-les-tags-visibles'
import { auteurDeLExport } from '@/features/utilisateurs/ui/auteur-de-l-export'
import { dateAsIsoDay } from '@/libraries/date/dateAsIsoDay'

const sourcesDeMesStatistiques = {
  perimetreDe: perimetreDeLUtilisateur,
  lancer: statistiquesDuPerimetre(rendezVousAuxStatutsSql),
  rassembler,
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
