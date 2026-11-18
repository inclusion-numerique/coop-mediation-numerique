import { rechercherUnLieuActiviteAction } from '@/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { rechercherDesEmployeusesAction } from '@/app/_actions/utilisateurs/rechercher-des-employeuses.action'
import CoopPageContainer from '@/app/coop/CoopPageContainer'
import { metadataTitle } from '@/app/metadataTitle'
import { optionsDesFiltres } from '@/composition/utilisateurs/options-des-filtres'
import { RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@/features/lieux-activite/abilities/rechercher-un-lieu-activite/action/rechercher-un-lieu-activite.key'
import { BoutonExporterLesUtilisateurs } from '@/features/utilisateurs/abilities/exporter-les-utilisateurs/ui'
import {
  ordreDesUtilisateurs,
  rechercherDesUtilisateurs,
} from '@/features/utilisateurs/abilities/lister-les-utilisateurs'
import { RECHERCHER_DES_EMPLOYEUSES_ACTION_KEY } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/action/rechercher-des-employeuses.key'
import {
  type ParametresDeLaListe,
  UtilisateursPage,
} from '@/features/utilisateurs/abilities/lister-les-utilisateurs/ui'
import {
  filtresUtilisateurs,
  parametresDesFiltres,
} from '@/features/utilisateurs/domain'
import { libellesDesFiltres } from '@/features/utilisateurs/ui'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

export const metadata = {
  title: metadataTitle('Utilisateurs'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async (props: { searchParams: Promise<ParametresDeLaListe> }) => {
  const searchParams = await props.searchParams
  const filtres = filtresUtilisateurs(searchParams)

  const [trouves, options] = await Promise.all([
    rechercherDesUtilisateurs({
      searchParams,
      filtres,
      orderBy: ordreDesUtilisateurs(searchParams),
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
