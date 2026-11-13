import { fenetreDe } from '@app/web/features/activites/abilities/compter-les-accompagnements-par-periode'
import {
  CoordinateurId,
  criteresDesStatistiques,
  Jour,
  MediateurId,
  perimetreDuDemandeur,
} from '@app/web/features/activites/domain'
import { statistiquesFournies } from '@app/web/features/activites/ui/statistiques/statistiques-fournies'
import { conseillerNumeriqueSql } from '@app/web/features/employeuse/server'
import { rendezVousAuxStatutsSql } from '@app/web/features/rdvsp/abilities/lister-les-rdvs-des-activites'
import { getFiltersOptionsForMediateur } from '@app/web/features/statistiques/db/options-des-filtres'
import type { ActivitesFilters } from '@app/web/features/statistiques/domain/filtres-des-statistiques'
import { prismaClient } from '@app/web/prismaClient'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import type {
  UserDisplayName,
  UserProfile,
  UserRdvAccount,
} from '@app/web/utils/user'

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
  user: UserDisplayName & UserProfile & UserRdvAccount
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

  const {
    communesOptions,
    departementsOptions,
    tagsOptions,
    initialMediateursOptions,
    initialBeneficiairesOptions,
    lieuxActiviteOptions,
    structuresEmployeusesOptions,
    activiteSourceOptions,
    activiteDates,
  } = await getFiltersOptionsForMediateur({
    user,
    mediateurCoordonnesIds,
    includeBeneficiaireIds: activitesFilters.beneficiaires,
  })

  return {
    ...statistiques,
    activitesFilters,
    communesOptions,
    departementsOptions,
    tagsOptions,
    initialMediateursOptions,
    initialBeneficiairesOptions,
    lieuxActiviteOptions,
    structuresEmployeusesOptions,
    activiteSourceOptions,
    activiteDates,
  }
}

export type MesStatistiquesPageData = Awaited<
  ReturnType<typeof getMesStatistiquesPageData>
>
