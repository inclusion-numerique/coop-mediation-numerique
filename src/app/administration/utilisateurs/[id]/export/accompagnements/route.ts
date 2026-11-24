import type { NextRequest } from 'next/server'
import { classeurDeMesAccompagnements } from '@/features/activites/abilities/exporter-mes-accompagnements/implementations/excel/classeur-de-mes-accompagnements.classeur'
import { classeurPresenteAvec } from '@/features/activites/abilities/exporter-mes-accompagnements/ui/presenters/export.presenter'
import { criteresDesFiltres } from '@/features/activites/ui/filtres/activites.filtre'
import { filtresDeToutesLesActivites } from '@/features/activites/ui/filtres/toutes-les-activites.filtre'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import {
  utilisateurDeLaSessionParId,
  utilisateurDuJetonDeSession,
} from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.query'
import { jetonDeSessionDesCookies } from '@/features/authentification/implementations/session/session-token-from-cookies.query'
import { beneficiairesInitiauxAvec } from '@/features/beneficiaire/abilities/rechercher-beneficiaires/implementations/beneficiaires-initiaux.binding'
import { optionsDesBeneficiairesInitiaux } from '@/features/beneficiaire/abilities/rechercher-beneficiaires/ui/presenters/options-des-beneficiaires-initiaux.presenter'
import { mediateurCoordonnesEtAnciensIdsFor } from '@/features/equipe/domain/mediateurs-coordonnes'
import { communesDuMediateur } from '@/features/lieux-activite/abilities/lister-les-options-de-lieux/implementations/prisma/communes-du-mediateur.query'
import { getLieuxDesActivitesOptions } from '@/features/lieux-activite/abilities/lister-les-options-de-lieux/implementations/prisma/options-de-lieux-des-activites.query'
import { tagsVisiblesPar } from '@/features/tags/abilities/lire-les-tags-visibles/implementations/session/tags-visibles-par.query'
import { acteurDe } from '@/features/tags/domain'
import { UtilisateurId } from '@/features/utilisateurs/domain'
import { auteurDeLExport } from '@/features/utilisateurs/ui/presenters/auteur-de-l-export.presenter'
import { dateAsIsoDay } from '@/libraries/date/dateAsIsoDay'

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
  const classeur = await classeurDeMesAccompagnements({
    criteres: criteresDesFiltres(valeurs),
    demandeur: {
      mediateurId: user.mediateur?.id ?? null,
      coordinateurId: user.coordinateur?.id ?? null,
      equipe: mediateurCoordonnesEtAnciensIdsFor(user),
    },
    auteur: auteurDeLExport(administrateur),
    fuseau: user.timezone,
    presenter: classeurPresenteAvec(valeurs),
    fournisseurs: {
      lieuxDesActivites: getLieuxDesActivitesOptions,
      communesEtDepartements: communesDuMediateur,
      tagsVisibles: tagsVisiblesPar(acteurDe(profilDeLaSession(user))),
      beneficiaires: (ids) =>
        beneficiairesInitiauxAvec(optionsDesBeneficiairesInitiaux)({
          mediateurId: user.mediateur?.id,
          includeBeneficiaireIds: [...ids],
        }),
    },
  })

  return new Response(await classeur.xlsx.writeBuffer(), {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="coop-numerique_accompagnements_${dateAsIsoDay(new Date())}.xlsx"`,
    },
  })
}
