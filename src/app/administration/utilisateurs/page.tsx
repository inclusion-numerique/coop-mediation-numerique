import { rechercherDesCommunesAction } from '@/app/_actions/utilisateurs/rechercher-des-communes.action'
import { rechercherDesCoordinateursAction } from '@/app/_actions/utilisateurs/rechercher-des-coordinateurs.action'
import { rechercherDesEmployeusesAction } from '@/app/_actions/utilisateurs/rechercher-des-employeuses.action'
import { rechercherDesLieuxAction } from '@/app/_actions/utilisateurs/rechercher-des-lieux.action'
import { metadataTitle } from '@/configuration/projet'
import { authenticateAdmin } from '@/features/authentification/implementations/session/authenticate-user.middleware'
import { nomDeLEmployeuse } from '@/features/employeuse/abilities/consulter-employeuse/implementations/prisma/nom-de-l-employeuse.query'
import { communesDesEmployeuses } from '@/features/employeuse/abilities/rechercher-employeuse/implementations/prisma/communes-des-employeuses.query'
import { lieuxChoisis } from '@/features/lieux-activite/abilities/lister-les-options-de-lieux/implementations/prisma/lieux-a-choisir.query'
import { BoutonExporterLesUtilisateurs } from '@/features/utilisateurs/abilities/exporter-les-utilisateurs/ui/slots/BoutonExporterLesUtilisateurs.slot'
import { RECHERCHER_DES_COMMUNES_ACTION_KEY } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/action/rechercher-des-communes.key'
import { RECHERCHER_DES_COORDINATEURS_ACTION_KEY } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/action/rechercher-des-coordinateurs.key'
import { RECHERCHER_DES_EMPLOYEUSES_ACTION_KEY } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/action/rechercher-des-employeuses.key'
import { RECHERCHER_DES_LIEUX_ACTION_KEY } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/action/rechercher-des-lieux.key'
import { optionsDesFiltres } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/implementations/prisma/options-des-filtres.query'
import { rechercherDesUtilisateurs } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/implementations/prisma/rechercher-des-utilisateurs.query'
import { listeDesUtilisateurs } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/ui/filtres/liste-des-utilisateurs.filtre'
import { UtilisateursPage } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/ui/pages/UtilisateursPage'
import { optionDuCoordinateur } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/ui/presenters/coordinateur-a-choisir.presenter'
import { liensDeLaListe } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/ui/presenters/liste-des-utilisateurs.presenter'
import { BarreDesUtilisateurs } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/ui/slots/BarreDesUtilisateurs.slot'
import {
  filtresDesUtilisateurs,
  filtresUtilisateursDesFiltres,
} from '@/features/utilisateurs/ui/filtres/utilisateurs.filtre'
import { barreDesUtilisateurs } from '@/features/utilisateurs/ui/presenters/barre-des-utilisateurs.presenter'
import { ClientBinder } from '@/libraries/nextjs/injection'
import { motsDe } from '@/libraries/texte'

export const metadata = {
  title: metadataTitle('Utilisateurs'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async (props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) => {
  await authenticateAdmin()
  const searchParams = await props.searchParams
  const valeurs = filtresDesUtilisateurs.charger(searchParams)
  const filtres = filtresUtilisateursDesFiltres(valeurs)
  const { tri, pagination } = listeDesUtilisateurs.charger(searchParams)

  const [trouves, options] = await Promise.all([
    rechercherDesUtilisateurs({
      mots: motsDe(valeurs.recherche),
      filtres,
      tri,
      ...pagination,
      maintenant: new Date(),
    }),
    optionsDesFiltres(filtres, {
      optionDuCoordinateur,
      communes: communesDesEmployeuses,
      lieux: lieuxChoisis,
      nomDeLEmployeuse,
    }),
  ])

  const barre = barreDesUtilisateurs({
    adresse: {
      chemin: '/administration/utilisateurs',
      parametres: searchParams,
    },
    valeurs,
    options,
  })

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
              barreDeFiltres={(actions) => (
                <BarreDesUtilisateurs barre={barre} actions={actions} />
              )}
              liens={liensDeLaListe(searchParams, trouves)}
              actions={
                <BoutonExporterLesUtilisateurs
                  requete={barre.export.requete}
                  libelles={barre.export.libelles}
                  nombre={trouves.totalItems}
                  recherche={barre.export.recherche}
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
