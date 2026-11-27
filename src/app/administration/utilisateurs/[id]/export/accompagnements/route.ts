import type { NextRequest } from 'next/server'
import {
  demandeurDe,
  exporterMesAccompagnements,
} from '@/features/activites/abilities/exporter-mes-accompagnements/domain'
import { classeurDeMesAccompagnements } from '@/features/activites/abilities/exporter-mes-accompagnements/implementations/excel/classeur-de-mes-accompagnements.classeur'
import {
  accompagnementsExportes,
  importsV1Presents,
} from '@/features/activites/abilities/exporter-mes-accompagnements/implementations/prisma/accompagnements-exportes.query'
import { employeusesNommees } from '@/features/activites/abilities/exporter-mes-accompagnements/implementations/prisma/employeuses-nommees.query'
import { mediateursLus } from '@/features/activites/abilities/exporter-mes-accompagnements/implementations/prisma/mediateurs-lus.query'
import { classeurPresenteAvec } from '@/features/activites/abilities/exporter-mes-accompagnements/ui/presenters/export.presenter'
import { nomDuFichierDesAccompagnements } from '@/features/activites/abilities/exporter-mes-accompagnements/ui/presenters/nom-du-fichier.presenter'
import { tagsUtilisablesDepuis } from '@/features/activites/implementations/prisma/fournisseurs-de-la-saisie.transfer'
import { dansLaPeriodeDAppartenance } from '@/features/activites/implementations/prisma/statistiques/periode-d-appartenance.sql'
import { criteresDesFiltres } from '@/features/activites/ui/filtres/activites.filtre'
import { filtresDeToutesLesActivites } from '@/features/activites/ui/filtres/toutes-les-activites.filtre'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import {
  utilisateurDeLaSessionParId,
  utilisateurDuJetonDeSession,
} from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.query'
import { jetonDeSessionDesCookies } from '@/features/authentification/implementations/session/session-token-from-cookies.query'
import { beneficiairesProposes } from '@/features/beneficiaire/abilities/rechercher-beneficiaires/implementations/prisma/rechercher-beneficiaires.query'
import { optionsDesBeneficiairesInitiaux } from '@/features/beneficiaire/abilities/rechercher-beneficiaires/ui/presenters/options-des-beneficiaires-initiaux.presenter'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { mediateurCoordonnesEtAnciensIdsFor } from '@/features/equipe/domain/mediateurs-coordonnes'
import { communesDuMediateur } from '@/features/lieux-activite/abilities/lister-les-options-de-lieux/implementations/prisma/communes-du-mediateur.query'
import { getLieuxDesActivitesOptions } from '@/features/lieux-activite/abilities/lister-les-options-de-lieux/implementations/prisma/options-de-lieux-des-activites.query'
import { tagsVisiblesPar } from '@/features/tags/abilities/lire-les-tags-visibles/implementations/prisma/tags-visibles-par.query'
import { acteurDe } from '@/features/tags/implementations/session/acteur.transfer'
import { UtilisateurId } from '@/features/utilisateurs/domain'
import { auteurDeLExport } from '@/features/utilisateurs/ui/presenters/auteur-de-l-export.presenter'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 300

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const administrateur = await utilisateurDuJetonDeSession(
    jetonDeSessionDesCookies(request.cookies),
  )

  if (!administrateur) return new Response('Unauthorized', { status: 401 })
  if (administrateur.role !== 'Admin')
    return new Response('Forbidden', { status: 403 })

  const utilisateurId = UtilisateurId.safe((await params).id)
  if (utilisateurId === null) return new Response('Not found', { status: 404 })

  const user = await utilisateurDeLaSessionParId(utilisateurId)

  const valeurs = filtresDeToutesLesActivites.charger(
    request.nextUrl.searchParams,
  )
  const criteres = criteresDesFiltres(valeurs)
  const demandeur = demandeurDe({
    mediateurId: user.mediateur?.id ?? null,
    coordinateurId: user.coordinateur?.id ?? null,
    equipe: mediateurCoordonnesEtAnciensIdsFor(user),
  })
  const exporte = await exporterMesAccompagnements({
    accompagnementsExportes,
    importsV1Presents,
    mediateursLus,
    employeusesNommees,
    lieuxNommes: ({ mediateurs, mediateurId, coordinateurId }) =>
      getLieuxDesActivitesOptions({
        mediateurIds: [...mediateurs],
        ...(mediateurId === null ? {} : { mediateurId }),
        perimetreDesActivites: dansLaPeriodeDAppartenance(coordinateurId),
      }),
    communesEtDepartements: communesDuMediateur,
    tagsUtilisables: tagsUtilisablesDepuis(
      tagsVisiblesPar(acteurDe(profilDeLaSession(user))),
    ),
    beneficiairesNommes: async ({ mediateurId, ids }) =>
      optionsDesBeneficiairesInitiaux(
        await beneficiairesProposes({
          mediateurId: MediateurId(mediateurId),
          includeBeneficiaireIds: ids.map(BeneficiaireId),
        }),
      ),
  })({ demandeur, criteres })
  if (!exporte.success) return new Response('Not found', { status: 404 })
  const { exportDes, noms } = exporte.data
  const classeur = classeurDeMesAccompagnements({
    criteres,
    noms,
    exportDes,
    auteur: auteurDeLExport(administrateur),
    fuseau: user.timezone,
    presenter: classeurPresenteAvec(valeurs),
  })

  return new Response(await classeur.xlsx.writeBuffer(), {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${nomDuFichierDesAccompagnements(new Date())}"`,
    },
  })
}
