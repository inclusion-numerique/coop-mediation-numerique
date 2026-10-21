import { rechercherUnLieuActiviteAction } from '@app/web/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { rechercherDesEmployeusesAction } from '@app/web/app/_actions/utilisateurs/rechercher-des-employeuses.action'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { optionsDesFiltres } from '@app/web/composition/utilisateurs/options-des-filtres'
import { RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@app/web/features/lieux-activite/abilities/rechercher-un-lieu-activite/action/rechercher-un-lieu-activite.key'
import { BoutonExporterLesUtilisateurs } from '@app/web/features/utilisateurs/abilities/exporter-les-utilisateurs/ui'
import {
  rechercherDesUtilisateurs,
  triDesUtilisateurs,
} from '@app/web/features/utilisateurs/abilities/lister-les-utilisateurs'
import { RECHERCHER_DES_EMPLOYEUSES_ACTION_KEY } from '@app/web/features/utilisateurs/abilities/lister-les-utilisateurs/action/rechercher-des-employeuses.key'
import {
  UtilisateursDataTable,
  type UtilisateursDataTableSearchParams,
  UtilisateursPage,
} from '@app/web/features/utilisateurs/abilities/lister-les-utilisateurs/ui'
import {
  filtresUtilisateurs,
  type ParametresDeFiltres,
  parametresDesFiltres,
} from '@app/web/features/utilisateurs/domain'
import { libellesDesFiltres } from '@app/web/features/utilisateurs/ui'
import { getDataTableOrderBy } from '@app/web/libs/data-table/getDataTableOrderBy'
import { ClientBinder } from '@app/web/libs/injection/client-binder'

export const metadata = {
  title: metadataTitle('Utilisateurs'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async (props: {
  searchParams: Promise<UtilisateursDataTableSearchParams & ParametresDeFiltres>
}) => {
  const searchParams = await props.searchParams
  const filtres = filtresUtilisateurs(searchParams)

  const [trouves, options] = await Promise.all([
    rechercherDesUtilisateurs({
      searchParams,
      filtres,
      orderBy: getDataTableOrderBy(
        searchParams,
        UtilisateursDataTable,
        triDesUtilisateurs,
      ),
      maintenant: new Date(),
    }),
    optionsDesFiltres(filtres),
  ])

  return (
    <ClientBinder
      bind={RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY}
      to={rechercherUnLieuActiviteAction}
    >
      <ClientBinder
        bind={RECHERCHER_DES_EMPLOYEUSES_ACTION_KEY}
        to={rechercherDesEmployeusesAction}
      >
        <CoopPageContainer size="full">
          <UtilisateursPage
            trouves={trouves}
            filtres={filtres}
            options={options}
            searchParams={searchParams}
            actions={
              <BoutonExporterLesUtilisateurs
                parametres={parametresDesFiltres(filtres)}
                libelles={libellesDesFiltres(filtres, options)}
                nombre={trouves.matchesCount}
                recherche={searchParams.recherche ?? null}
              />
            }
          />
        </CoopPageContainer>
      </ClientBinder>
    </ClientBinder>
  )
}

export default Page
