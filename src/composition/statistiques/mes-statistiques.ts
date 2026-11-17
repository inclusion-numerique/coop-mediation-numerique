import { mediateurCoordonnesEtAnciensIdsFor } from '@/auth/mediateursCoordonnes'
import type { SessionUser } from '@/auth/sessionUser'
import {
  rassembler,
  statistiquesEnCours,
} from '@/composition/statistiques/statistiques-fournies'
import { fenetreDe } from '@/features/activites/abilities/compter-les-accompagnements-par-periode'
import { decrireLesActivitesDuPerimetre } from '@/features/activites/abilities/decrire-les-activites-du-perimetre'
import { criteresDesStatistiques, Jour } from '@/features/activites/domain'
import { getInitialBeneficiairesOptionsForSearch } from '@/features/beneficiaire/abilities/rechercher-beneficiaires/ui/get-initial-beneficiaires-options-for-search'
import { conseillerNumeriqueSql } from '@/features/employeuse/server'
import { listerLesMembresAFiltrer } from '@/features/equipe/abilities/lister-les-membres-a-filtrer'
import {
  CoordinateurId as CoordinateurIdDeLEquipe,
  MediateurId as MediateurIdDeLEquipe,
} from '@/features/equipe/domain'
import { rendezVousAuxStatutsSql } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites'
import { optionsDesStatistiques } from '@/features/statistiques/ui/filtres/options-de-la-barre.presenter'
import type { ActivitesFilters } from '@/features/statistiques/ui/filtres/parametres-de-la-barre'
import { tousLesTagsVisiblesPar } from '@/features/tags/abilities/lire-les-tags-visibles'
import { dateAsIsoDay } from '@/utils/dateAsIsoDay'
import { vocabulaireDeLaBarre } from './barre'
import { lieuxChoisisDe } from './lieux-choisis'
import { perimetreDeLUtilisateur } from './perimetre'

export type MesStatistiquesGraphOptions = {
  fin?: Date
  debut?: Date
}

export const mesStatistiques = async ({
  user,
  activitesFilters,
  graphOptions = {},
}: {
  user: SessionUser
  activitesFilters: ActivitesFilters
  graphOptions?: MesStatistiquesGraphOptions
}) => {
  const mediateurCoordonnesIds = mediateurCoordonnesEtAnciensIdsFor(user)

  const perimetre = perimetreDeLUtilisateur(user)
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

  const statistiques = statistiquesEnCours(
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

  const options = await optionsDesStatistiques({
    lieuxChoisis: () => lieuxChoisisDe(activitesFilters, perimetre),
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
  })

  return {
    ...options,
    activitesFilters,
    vocabulaire: vocabulaireDeLaBarre,
    statistiques,
  }
}

export const getMesStatistiquesPageData = async (
  parametres: Parameters<typeof mesStatistiques>[0],
) => {
  const { statistiques, ...options } = await mesStatistiques(parametres)
  return { ...(await rassembler(statistiques)), ...options }
}

export type MesStatistiquesPageData = Awaited<
  ReturnType<typeof getMesStatistiquesPageData>
>
