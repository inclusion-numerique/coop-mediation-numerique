import { rechercherUnLieuActiviteAction } from '@/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { rechercherDesCoordinateursAction } from '@/app/_actions/utilisateurs/rechercher-des-coordinateurs.action'
import { rechercherDesEmployeusesAction } from '@/app/_actions/utilisateurs/rechercher-des-employeuses.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { authenticateAdmin } from '@/features/authentification/implementation/session/authenticateUser'
import { nomDeLEmployeuse } from '@/features/employeuse/server'
import {
  getCommunesAndDepartementsOptions,
  getLieuxActiviteOptions,
} from '@/features/lieux-activite/abilities/lister-les-options-de-lieux'
import { RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@/features/lieux-activite/abilities/rechercher-un-lieu-activite/action/rechercher-un-lieu-activite.key'
import { LieuFilter } from '@/features/lieux-activite/ui'
import { BoutonExporterLesUtilisateurs } from '@/features/utilisateurs/abilities/exporter-les-utilisateurs/ui'
import {
  optionsDesFiltres,
  ordreDesUtilisateurs,
  rechercherDesUtilisateurs,
} from '@/features/utilisateurs/abilities/lister-les-utilisateurs'
import { RECHERCHER_DES_COORDINATEURS_ACTION_KEY } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/action/rechercher-des-coordinateurs.key'
import { RECHERCHER_DES_EMPLOYEUSES_ACTION_KEY } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/action/rechercher-des-employeuses.key'
import {
  type ParametresDeLaListe,
  UtilisateursPage,
  valeursDeLieu,
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
      communesEtDepartements: getCommunesAndDepartementsOptions,
      lieux: getLieuxActiviteOptions,
      nomDeLEmployeuse,
    }),
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
        <ClientBinder
          bind={RECHERCHER_DES_COORDINATEURS_ACTION_KEY}
          to={rechercherDesCoordinateursAction}
        >
          <UtilisateursPage
            trouves={trouves}
            filtres={filtres}
            options={options}
            searchParams={searchParams}
            filtreDeLieu={
              <LieuFilter
                defaultValue={valeursDeLieu(filtres)}
                lieuxActiviteOptions={[...options.lieux]}
                communesOptions={[...options.communes]}
                departementsOptions={[...options.departements]}
              />
            }
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
  )
}

export default Page
