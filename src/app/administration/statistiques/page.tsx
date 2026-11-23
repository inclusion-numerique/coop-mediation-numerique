import { rechercherLesLieuxNationauxAction } from '@/app/_actions/statistiques/rechercher-les-lieux-nationaux.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import {
  criteresDesStatistiques,
  PERIMETRE_NATIONAL,
} from '@/features/activites/domain'
import {
  lieuxChoisisDe,
  statistiquesNationalesEnCours,
} from '@/features/activites/implementations/statistiques'
import {
  blocsActivites,
  blocsBeneficiaires,
  blocsGeneraux,
} from '@/features/activites/ui/components/blocs-des-statistiques'
import { vocabulaireDesActivites } from '@/features/activites/ui/labels/libelles/vocabulaire-des-statistiques.labels'
import { authenticateAdmin } from '@/features/authentification/implementations/session/authenticate-user'
import { rendezVousAuxStatutsSql } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites/implementations/prisma/rdvs-des-activites.query'
import { rdvStatusOptions } from '@/features/rdvsp/ui/presenters/statut-rdv'
import { RECHERCHER_LES_LIEUX_DES_STATISTIQUES_ACTION_KEY } from '@/features/statistiques/action/rechercher-les-lieux-des-statistiques.key'
import {
  sectionActivites,
  sectionBeneficiaires,
  sectionGenerale,
} from '@/features/statistiques/ui/components/sections-des-statistiques'
import { StatistiquesNationales } from '@/features/statistiques/ui/pages/StatistiquesNationales'
import { optionsDeTags } from '@/features/statistiques/ui/presenters/options-de-la-barre.presenter'
import {
  type ActivitesFilters,
  validateActivitesFilters,
} from '@/features/statistiques/ui/presenters/parametres-de-la-barre'
import { activiteSourceOptions } from '@/features/statistiques/ui/presenters/source-de-l-activite'
import { FiltreDeLieu } from '@/features/statistiques/ui/slots/FiltreDeLieu.slot'
import { lireLesTagsCollectifs } from '@/features/tags/abilities/lire-les-tags-visibles/implementations/prisma/lire-les-tags-visibles.query'
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
  await authenticateAdmin()
  const searchParams = await props.searchParams
  const activitesFilters = validateActivitesFilters(searchParams)
  const statistiques = statistiquesNationalesEnCours(
    criteresDesStatistiques(activitesFilters),
    { tags: true, rendezVousAuxStatuts: rendezVousAuxStatutsSql },
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
        vocabulaire={{
          ...vocabulaireDesActivites,
          statutsDeRendezVous: rdvStatusOptions,
        }}
        filtreDeLieu={<FiltreDeLieu choisis={lieuxChoisis} />}
        {...lieuxChoisis}
        tagsOptions={tagsOptions}
        activiteSourceOptions={activiteSourceOptions}
        generale={sectionGenerale(blocsGeneraux(statistiques), {
          wording: 'generique',
        })}
        activites={sectionActivites(
          blocsActivites({
            totalCounts: statistiques.totalCounts,
            repartition: statistiques.repartition,
            tags: statistiques.tags,
          }),
          { wording: 'generique' },
        )}
        beneficiaires={sectionBeneficiaires(
          blocsBeneficiaires({ profil: statistiques.profil }),
          { wording: 'generique' },
        )}
      />
    </ClientBinder>
  )
}

export default Page
