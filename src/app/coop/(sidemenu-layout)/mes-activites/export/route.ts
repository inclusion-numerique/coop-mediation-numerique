import type { NextRequest } from 'next/server'
import { exporterMesAccompagnements } from '@/features/activites/abilities/exporter-mes-accompagnements/domain'
import { classeurDeMesAccompagnements } from '@/features/activites/abilities/exporter-mes-accompagnements/implementations/excel/classeur-de-mes-accompagnements.classeur'
import {
  beneficiairesDepuisLesOptions,
  communesEtDepartementsDepuisLesOptions,
  lieuxDepuisLesOptions,
} from '@/features/activites/abilities/exporter-mes-accompagnements/implementations/options/noms-depuis-les-options.transfer'
import {
  accompagnementsExportes,
  importsV1Presents,
} from '@/features/activites/abilities/exporter-mes-accompagnements/implementations/prisma/accompagnements-exportes.query'
import { employeusesNommees } from '@/features/activites/abilities/exporter-mes-accompagnements/implementations/prisma/employeuses-nommees.query'
import { mediateursLus } from '@/features/activites/abilities/exporter-mes-accompagnements/implementations/prisma/mediateurs-lus.query'
import { demandeurDe } from '@/features/activites/abilities/exporter-mes-accompagnements/implementations/session/demandeur.transfer'
import { classeurPresenteAvec } from '@/features/activites/abilities/exporter-mes-accompagnements/ui/presenters/export.presenter'
import { nomDuFichierDesAccompagnements } from '@/features/activites/abilities/exporter-mes-accompagnements/ui/presenters/nom-du-fichier.presenter'
import { tagsUtilisablesDepuis } from '@/features/activites/implementations/prisma/fournisseurs-de-la-saisie.transfer'
import { dansLaPeriodeDAppartenance } from '@/features/activites/implementations/prisma/statistiques/periode-d-appartenance.sql'
import { criteresDesFiltres } from '@/features/activites/ui/filtres/activites.filtre'
import { filtresDeToutesLesActivites } from '@/features/activites/ui/filtres/toutes-les-activites.filtre'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { utilisateurDuJetonDeSession } from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.query'
import { jetonDeSessionDesCookies } from '@/features/authentification/implementations/session/session-token-from-cookies.query'
import { beneficiairesProposes } from '@/features/beneficiaire/abilities/rechercher-beneficiaires/implementations/prisma/rechercher-beneficiaires.query'
import { optionsDesBeneficiairesInitiaux } from '@/features/beneficiaire/abilities/rechercher-beneficiaires/ui/presenters/options-des-beneficiaires-initiaux.presenter'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { mediateurCoordonnesEtAnciensIdsFor } from '@/features/equipe/implementations/session/mediateurs-coordonnes.transfer'
import { communesDuMediateur } from '@/features/lieux-activite/abilities/lister-les-options-de-lieux/implementations/prisma/communes-du-mediateur.query'
import { getLieuxDesActivitesOptions } from '@/features/lieux-activite/abilities/lister-les-options-de-lieux/implementations/prisma/options-de-lieux-des-activites.query'
import { tagsVisiblesPar } from '@/features/tags/abilities/lire-les-tags-visibles/implementations/prisma/tags-visibles-par.query'
import { acteurDe } from '@/features/tags/implementations/session/acteur.transfer'
import { auteurDeLExport } from '@/features/utilisateurs/ui/presenters/auteur-de-l-export.presenter'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 300

export const GET = async (request: NextRequest) => {
  const user = await utilisateurDuJetonDeSession(
    jetonDeSessionDesCookies(request.cookies),
  )

  if (!user) return new Response('Unauthorized', { status: 401 })

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
    lieuxNommes: async ({ mediateurs, mediateurId, coordinateurId }) =>
      lieuxDepuisLesOptions(
        await getLieuxDesActivitesOptions({
          mediateurIds: [...mediateurs],
          ...(mediateurId === null ? {} : { mediateurId }),
          perimetreDesActivites: dansLaPeriodeDAppartenance(coordinateurId),
        }),
      ),
    communesEtDepartements: async ({ mediateurIds }) =>
      communesEtDepartementsDepuisLesOptions(
        await communesDuMediateur({ mediateurIds: [...mediateurIds] }),
      ),
    tagsUtilisables: tagsUtilisablesDepuis(
      tagsVisiblesPar(acteurDe(profilDeLaSession(user))),
    ),
    beneficiairesNommes: async ({ mediateurId, ids }) =>
      beneficiairesDepuisLesOptions(
        optionsDesBeneficiairesInitiaux(
          await beneficiairesProposes({
            mediateurId: MediateurId(mediateurId),
            includeBeneficiaireIds: ids.map(BeneficiaireId),
          }),
        ),
      ),
  })({ demandeur, criteres })
  if (!exporte.success) return new Response('Unauthorized', { status: 401 })
  const { exportDes, noms } = exporte.data
  const maintenant = new Date()
  const classeur = classeurDeMesAccompagnements({
    date: maintenant,
    criteres,
    noms,
    exportDes,
    auteur: auteurDeLExport(user),
    fuseau: user.timezone,
    presenter: classeurPresenteAvec(valeurs),
  })

  const data = await classeur.xlsx.writeBuffer()
  const filename = nomDuFichierDesAccompagnements(maintenant)

  return new Response(data, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
