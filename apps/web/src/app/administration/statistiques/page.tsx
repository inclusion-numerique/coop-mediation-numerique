import { rechercherUnLieuActiviteAction } from '@app/web/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import {
  sectionActivites,
  sectionBeneficiaires,
  sectionGenerale,
} from '@app/web/composition/statistiques/sections'
import { fenetreDe } from '@app/web/features/activites/abilities/compter-les-accompagnements-par-periode'
import {
  criteresDesStatistiques,
  Jour,
  PERIMETRE_NATIONAL,
} from '@app/web/features/activites/domain'
import { statistiquesFournies } from '@app/web/features/activites/ui/statistiques/statistiques-fournies'
import { conseillerNumeriqueSql } from '@app/web/features/employeuse/server'
import {
  getCommunesAndDepartementsOptions,
  getLieuxActiviteOptions,
} from '@app/web/features/lieux-activite/abilities/lister-les-options-de-lieux'
import { RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@app/web/features/lieux-activite/abilities/rechercher-un-lieu-activite/action/rechercher-un-lieu-activite.key'
import { rendezVousAuxStatutsSql } from '@app/web/features/rdvsp/abilities/lister-les-rdvs-des-activites'
import { getTagsCollectifs } from '@app/web/features/statistiques/db/tags-collectifs'
import {
  type ActivitesFilters,
  validateActivitesFilters,
} from '@app/web/features/statistiques/domain/filtres-des-statistiques'
import Filters from '@app/web/features/statistiques/ui/filtres/Filters'
import { FilterTags } from '@app/web/features/statistiques/ui/filtres/FilterTags'
import { activiteSourceOptions } from '@app/web/features/statistiques/ui/filtres/source'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'

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
  const tagsOptions = await getTagsCollectifs()

  const [{ communesOptions, departementsOptions }, lieuxActiviteOptions] =
    await Promise.all([
      getCommunesAndDepartementsOptions(),
      getLieuxActiviteOptions(),
    ])

  const criteres = criteresDesStatistiques(activitesFilters)
  const aujourdhui = Jour(dateAsIsoDay(new Date()))
  const {
    totalCounts,
    accompagnementsParJour,
    accompagnementsParMois,
    beneficiaires,
    activites,
  } = await statistiquesFournies(
    {
      perimetre: PERIMETRE_NATIONAL,
      criteres,
      conseillersNumeriques: conseillerNumeriqueSql,
      rendezVousAuxStatuts: rendezVousAuxStatutsSql,
      parJour: fenetreDe({
        debut: criteres.periode.du,
        fin: criteres.periode.au ?? aujourdhui,
      }),
      parMois: fenetreDe({ debut: null, fin: aujourdhui }),
    },
    { territoires: false, tags: user.role === 'Admin' },
  )

  return (
    <ClientBinder
      bind={RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY}
      to={rechercherUnLieuActiviteAction}
    >
      <>
        <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-flex-gap-4v fr-mb-3w">
          <Filters
            defaultFilters={activitesFilters}
            communesOptions={communesOptions}
            departementsOptions={departementsOptions}
            lieuxActiviteOptions={lieuxActiviteOptions}
            structuresEmployeusesOptions={[]}
            tagsOptions={tagsOptions}
            initialMediateursOptions={[]}
            initialBeneficiairesOptions={[]}
            minDate={new Date('2020-01-01')}
            beneficiairesFilter={false}
            isCoordinateur={false}
            isMediateur={false}
            hasCrasV1={true}
          />
        </div>
        <FilterTags
          filters={activitesFilters}
          communesOptions={communesOptions}
          departementsOptions={departementsOptions}
          lieuxActiviteOptions={lieuxActiviteOptions}
          structuresEmployeusesOptions={[]}
          tagsOptions={[]}
          mediateursOptions={[]}
          beneficiairesOptions={[]}
          activiteSourceOptions={activiteSourceOptions}
        />
        <section className="fr-mb-6w">
          {sectionGenerale(
            { totalCounts, accompagnementsParJour, accompagnementsParMois },
            { wording: 'generique' },
          )}
        </section>
        <section className="fr-mb-6w">
          {sectionActivites(
            { activites, totalCounts },
            { wording: 'generique' },
          )}
        </section>
        <section className="fr-mb-6w">
          {sectionBeneficiaires(
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
        </section>
      </>
    </ClientBinder>
  )
}

export default Page
