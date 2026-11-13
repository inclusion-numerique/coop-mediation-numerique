import type { SessionUser } from '@app/web/auth/sessionUser'
import { fenetreDe } from '@app/web/features/activites/abilities/compter-les-accompagnements-par-periode'
import { decrireLesActivitesDuPerimetre } from '@app/web/features/activites/abilities/decrire-les-activites-du-perimetre'
import { verifierLaPresenceDeCrasV1 } from '@app/web/features/activites/abilities/verifier-la-presence-de-cras-v1'
import { dansLaPeriodeDAppartenance } from '@app/web/features/activites/db/periode-d-appartenance.sql'
import {
  CoordinateurId,
  criteresDesStatistiques,
  Jour,
  MediateurId,
  perimetreDuDemandeur,
} from '@app/web/features/activites/domain'
import { statistiquesFournies } from '@app/web/features/activites/ui/statistiques/statistiques-fournies'
import { getInitialBeneficiairesOptionsForSearch } from '@app/web/features/beneficiaire/abilities/rechercher-beneficiaires/ui/get-initial-beneficiaires-options-for-search'
import { conseillerNumeriqueSql } from '@app/web/features/employeuse/server'
import { listerLesMembresAFiltrer } from '@app/web/features/equipe/abilities/lister-les-membres-a-filtrer'
import {
  CoordinateurId as CoordinateurIdDeLEquipe,
  MediateurId as MediateurIdDeLEquipe,
} from '@app/web/features/equipe/domain'
import {
  getLieuxDesActivitesOptions,
  getMediateurCommunesAndDepartementsOptions,
} from '@app/web/features/lieux-activite'
import { rendezVousAuxStatutsSql } from '@app/web/features/rdvsp/abilities/lister-les-rdvs-des-activites'
import { optionsDesStatistiques } from '@app/web/features/statistiques/abilities/lister-les-options-des-statistiques'
import type { ActivitesFilters } from '@app/web/features/statistiques/domain/filtres-des-statistiques'
import { tousLesTagsVisiblesPar } from '@app/web/features/tags/abilities/lire-les-tags-visibles'
import { prismaClient } from '@app/web/prismaClient'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import { vocabulaireDeLaBarre } from './barre'

export type MesStatistiquesGraphOptions = {
  fin?: Date
  debut?: Date
}

const toMediateurId = ({ mediateurId }: { mediateurId: string }) => mediateurId

export const getMesStatistiquesPageData = async ({
  user,
  activitesFilters,
  graphOptions = {},
}: {
  user: SessionUser
  activitesFilters: ActivitesFilters
  graphOptions?: MesStatistiquesGraphOptions
}) => {
  const mediateurCoordonnes =
    user.coordinateur == null
      ? []
      : await prismaClient.mediateurCoordonne.findMany({
          where: { coordinateurId: user.coordinateur.id },
          select: { mediateurId: true },
        })

  // Un médiateur ré-invité a une ligne par passage dans l'équipe : on ne garde qu'un identifiant.
  const mediateurCoordonnesIds = [
    ...new Set(mediateurCoordonnes.map(toMediateurId)),
  ]

  const perimetre = perimetreDuDemandeur({
    mediateur: user.mediateur ? MediateurId(user.mediateur.id) : null,
    coordinateur: user.coordinateur
      ? CoordinateurId(user.coordinateur.id)
      : null,
    equipe: mediateurCoordonnesIds.map((id) => MediateurId(id)),
  })
  if (perimetre === null) {
    throw new Error('Statistiques sans profil médiateur ni coordinateur')
  }

  const criteres = criteresDesStatistiques(activitesFilters)
  const fenetre = fenetreDe({
    debut: criteres.periode.du,
    fin: Jour(
      dateAsIsoDay(
        graphOptions.fin ??
          (activitesFilters.au ? new Date(activitesFilters.au) : new Date()),
      ),
    ),
  })

  const statistiques = await statistiquesFournies(
    {
      perimetre,
      criteres,
      conseillersNumeriques: conseillerNumeriqueSql,
      rendezVousAuxStatuts: rendezVousAuxStatutsSql,
      parJour: fenetre,
      parMois: fenetre,
    },
    { territoires: true, tags: true },
  )

  const mediateurIds = [
    ...(user.mediateur ? [user.mediateur.id] : []),
    ...mediateurCoordonnesIds,
  ]

  const options = await optionsDesStatistiques({
    communesEtDepartements: () =>
      getMediateurCommunesAndDepartementsOptions({ mediateurIds }),
    lieux: () =>
      getLieuxDesActivitesOptions({
        mediateurIds,
        mediateurId: user.mediateur?.id,
        perimetreDesActivites: dansLaPeriodeDAppartenance(
          user.coordinateur ? CoordinateurId(user.coordinateur.id) : null,
        ),
      }),
    tags: () => tousLesTagsVisiblesPar(user),
    beneficiaires: () =>
      getInitialBeneficiairesOptionsForSearch({
        mediateurId: user.mediateur?.id,
        includeBeneficiaireIds: activitesFilters.beneficiaires,
      }),
    membres: async () =>
      user.coordinateur
        ? listerLesMembresAFiltrer({
            coordinateurId: CoordinateurIdDeLEquipe(user.coordinateur.id),
            demandeur: user.mediateur
              ? MediateurIdDeLEquipe(user.mediateur.id)
              : null,
            membres: mediateurCoordonnesIds.map((id) =>
              MediateurIdDeLEquipe(id),
            ),
          })
        : [],
    activitesDuPerimetre: () => decrireLesActivitesDuPerimetre(perimetre),
    presenceDeCrasV1: () => verifierLaPresenceDeCrasV1(perimetre),
  })

  return {
    ...statistiques,
    ...options,
    activitesFilters,
    vocabulaire: vocabulaireDeLaBarre,
  }
}

export type MesStatistiquesPageData = Awaited<
  ReturnType<typeof getMesStatistiquesPageData>
>
