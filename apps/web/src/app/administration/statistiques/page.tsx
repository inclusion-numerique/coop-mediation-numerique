import { rechercherUnLieuActiviteAction } from '@app/web/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import {
  filtreDeLieu,
  vocabulaireDeLaBarre,
} from '@app/web/composition/statistiques/barre'
import {
  sectionActivites,
  sectionBeneficiaires,
  sectionGenerale,
} from '@app/web/composition/statistiques/sections'
import { statistiquesNationales } from '@app/web/composition/statistiques/statistiques-nationales'
import { criteresDesStatistiques } from '@app/web/features/activites/domain'
import {
  getCommunesAndDepartementsOptions,
  getLieuxActiviteOptions,
} from '@app/web/features/lieux-activite/abilities/lister-les-options-de-lieux'
import { RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@app/web/features/lieux-activite/abilities/rechercher-un-lieu-activite/action/rechercher-un-lieu-activite.key'
import { optionsDeTags } from '@app/web/features/statistiques/abilities/lister-les-options-des-statistiques'
import {
  type ActivitesFilters,
  validateActivitesFilters,
} from '@app/web/features/statistiques/domain/filtres-des-statistiques'
import { activiteSourceOptions } from '@app/web/features/statistiques/ui/filtres/source'
import { StatistiquesNationales } from '@app/web/features/statistiques/ui/pages/StatistiquesNationales'
import { lireLesTagsCollectifs } from '@app/web/features/tags/abilities/lire-les-tags-visibles'
import { ClientBinder } from '@app/web/libs/injection/client-binder'

export const metadata = {
  title: metadataTitle('Statistiques'),
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async (props: {
  searchParams: Promise<
    ActivitesFilters & {
      graphique_fin?: string
    }
  >
}) => {
  const searchParams = await props.searchParams
  const activitesFilters = validateActivitesFilters(searchParams)
  const user = await authenticateUser()
  const tagsOptions = optionsDeTags(await lireLesTagsCollectifs())

  const [{ communesOptions, departementsOptions }, lieuxActiviteOptions] =
    await Promise.all([
      getCommunesAndDepartementsOptions(),
      getLieuxActiviteOptions(),
    ])

  const {
    totalCounts,
    accompagnementsParJour,
    accompagnementsParMois,
    beneficiaires,
    activites,
  } = await statistiquesNationales(criteresDesStatistiques(activitesFilters), {
    tags: user.role === 'Admin',
  })

  return (
    <ClientBinder
      bind={RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY}
      to={rechercherUnLieuActiviteAction}
    >
      <StatistiquesNationales
        activitesFilters={activitesFilters}
        vocabulaire={vocabulaireDeLaBarre}
        filtreDeLieu={filtreDeLieu(activitesFilters, {
          communesOptions,
          departementsOptions,
          lieuxActiviteOptions,
        })}
        communesOptions={communesOptions}
        departementsOptions={departementsOptions}
        lieuxActiviteOptions={lieuxActiviteOptions}
        tagsOptions={tagsOptions}
        activiteSourceOptions={activiteSourceOptions}
        generale={sectionGenerale(
          { totalCounts, accompagnementsParJour, accompagnementsParMois },
          { wording: 'generique' },
        )}
        activites={sectionActivites(
          { activites, totalCounts },
          { wording: 'generique' },
        )}
        beneficiaires={sectionBeneficiaires(
          {
            beneficiaires: {
              total: beneficiaires.total,
              genres: beneficiaires.genres,
              trancheAges: beneficiaires.trancheAges,
              statutsSocial: beneficiaires.statutsSocial,
            },
          },
          { wording: 'generique' },
        )}
      />
    </ClientBinder>
  )
}

export default Page
