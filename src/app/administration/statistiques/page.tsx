import { notFound } from 'next/navigation'
import { rechercherLesLieuxNationauxAction } from '@/app/_actions/statistiques/rechercher-les-lieux-nationaux.action'
import { metadataTitle } from '@/app/metadataTitle'
import { authenticateUser } from '@/auth/authenticateUser'
import {
  filtreDeLieu,
  vocabulaireDeLaBarre,
} from '@/composition/statistiques/barre'
import { lieuxChoisisDe } from '@/composition/statistiques/lieux-choisis'
import {
  sectionActivites,
  sectionBeneficiaires,
  sectionGenerale,
} from '@/composition/statistiques/sections'
import { statistiquesNationalesEnCours } from '@/composition/statistiques/statistiques-nationales'
import {
  criteresDesStatistiques,
  PERIMETRE_NATIONAL,
} from '@/features/activites/domain'
import { optionsDeTags } from '@/features/statistiques/ui/filtres/options-de-la-barre.presenter'
import {
  type ActivitesFilters,
  validateActivitesFilters,
} from '@/features/statistiques/ui/filtres/parametres-de-la-barre'
import { RECHERCHER_LES_LIEUX_DES_STATISTIQUES_ACTION_KEY } from '@/features/statistiques/ui/filtres/rechercher-les-lieux-des-statistiques.key'
import { activiteSourceOptions } from '@/features/statistiques/ui/filtres/source'
import { StatistiquesNationales } from '@/features/statistiques/ui/pages/StatistiquesNationales'
import { lireLesTagsCollectifs } from '@/features/tags/abilities/lire-les-tags-visibles'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

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
  if (user.role !== 'Admin') notFound()
  const statistiques = statistiquesNationalesEnCours(
    criteresDesStatistiques(activitesFilters),
    { tags: true },
  )
  const [tagsCollectifs, lieuxChoisis] = await Promise.all([
    lireLesTagsCollectifs(),
    lieuxChoisisDe(activitesFilters, PERIMETRE_NATIONAL),
  ])
  const tagsOptions = optionsDeTags(tagsCollectifs)

  return (
    <ClientBinder
      bind={RECHERCHER_LES_LIEUX_DES_STATISTIQUES_ACTION_KEY}
      to={rechercherLesLieuxNationauxAction}
    >
      <StatistiquesNationales
        activitesFilters={activitesFilters}
        vocabulaire={vocabulaireDeLaBarre}
        filtreDeLieu={filtreDeLieu(lieuxChoisis)}
        {...lieuxChoisis}
        tagsOptions={tagsOptions}
        activiteSourceOptions={activiteSourceOptions}
        generale={sectionGenerale(statistiques, { wording: 'generique' })}
        activites={sectionActivites(
          {
            totalCounts: statistiques.totalCounts,
            repartition: statistiques.repartition,
            tags: statistiques.tags,
          },
          { wording: 'generique' },
        )}
        beneficiaires={sectionBeneficiaires(
          { profil: statistiques.profil },
          { wording: 'generique' },
        )}
      />
    </ClientBinder>
  )
}

export default Page
