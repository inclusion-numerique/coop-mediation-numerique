import { rechercherDesCommunesAction } from '@/app/_actions/utilisateurs/rechercher-des-communes.action'
import { rechercherDesCoordinateursAction } from '@/app/_actions/utilisateurs/rechercher-des-coordinateurs.action'
import { rechercherDesEmployeusesAction } from '@/app/_actions/utilisateurs/rechercher-des-employeuses.action'
import { rechercherDesLieuxAction } from '@/app/_actions/utilisateurs/rechercher-des-lieux.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { authenticateAdmin } from '@/features/authentification/implementations/session/authenticate-user'
import { nomDeLEmployeuse } from '@/features/employeuse/abilities/consulter-employeuse/implementations/nom-de-l-employeuse'
import { communesDesEmployeuses } from '@/features/employeuse/abilities/rechercher-employeuse/implementations/prisma/communes-des-employeuses.query'
import { lieuxChoisis } from '@/features/lieux-activite/abilities/lister-les-options-de-lieux/implementations/prisma/lieux-a-choisir.query'
import { BoutonExporterLesUtilisateurs } from '@/features/utilisateurs/abilities/exporter-les-utilisateurs/ui/BoutonExporterLesUtilisateurs'
import { RECHERCHER_DES_COMMUNES_ACTION_KEY } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/action/rechercher-des-communes.key'
import { RECHERCHER_DES_COORDINATEURS_ACTION_KEY } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/action/rechercher-des-coordinateurs.key'
import { RECHERCHER_DES_EMPLOYEUSES_ACTION_KEY } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/action/rechercher-des-employeuses.key'
import { RECHERCHER_DES_LIEUX_ACTION_KEY } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/action/rechercher-des-lieux.key'
import { optionsDesFiltres } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/implementations/options-des-filtres'
import { rechercherDesUtilisateurs } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/implementations/prisma/rechercher-des-utilisateurs.query'
import { ordreDesUtilisateurs } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/implementations/prisma/tri-des-utilisateurs'
import { type ParametresDeLaListe } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/ui/lister-les-utilisateurs-search-params'
import { UtilisateursPage } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/ui/pages/UtilisateursPage'
import {
  filtresUtilisateurs,
  parametresDesFiltres,
} from '@/features/utilisateurs/domain'
import { libellesDesFiltres } from '@/features/utilisateurs/ui/libelles-des-filtres.presenter'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

export const metadata = {
  title: metadataTitle('Utilisateurs'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async (props: { searchParams: Promise<ParametresDeLaListe> }) => {
  await authenticateAdmin()
  const searchParams = await props.searchParams
  const filtres = filtresUtilisateurs(searchParams)

  const [trouves, options] = await Promise.all([
    rechercherDesUtilisateurs({
      searchParams,
      filtres,
      orderBy: ordreDesUtilisateurs(searchParams),
      maintenant: new Date(),
    }),
    optionsDesFiltres(filtres, {
      communes: communesDesEmployeuses,
      lieux: lieuxChoisis,
      nomDeLEmployeuse,
    }),
  ])

  return (
    <ClientBinder
      bind={RECHERCHER_DES_COMMUNES_ACTION_KEY}
      to={rechercherDesCommunesAction}
    >
      <ClientBinder
        bind={RECHERCHER_DES_LIEUX_ACTION_KEY}
        to={rechercherDesLieuxAction}
      >
        <ClientBinder
          bind={RECHERCHER_DES_EMPLOYEUSES_ACTION_KEY}
          to={rechercherDesEmployeusesAction}
        >
          <ClientBinder
            bind={RECHERCHER_DES_COORDINATEURS_ACTION_KEY}
            to={rechercherDesCoordinateursAction}
          >
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
          </ClientBinder>
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default Page
