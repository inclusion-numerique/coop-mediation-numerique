import type { ReactNode } from 'react'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skipLinks'
import { pluriel } from '@/libraries/pluriel'
import AdministrationBreadcrumbs from '@/libraries/ui/components/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@/libraries/ui/components/administration/AdministrationTitle'
import CoopPageContainer from '@/libraries/ui/components/CoopPageContainer'
import type { UtilisateursTrouves } from '../../domain'
import { RechercheDUtilisateurs } from '../components/RechercheDUtilisateurs'
import { UtilisateursPagination } from '../components/UtilisateursPagination'
import { UtilisateursTable } from '../components/UtilisateursTable'
import {
  etatDeLaTable,
  type ParametresDeLaListe,
} from '../search-params/lister-les-utilisateurs.search-params'

const BASE_HREF = '/administration/utilisateurs'

export const UtilisateursPage = ({
  trouves,
  barreDeFiltres,
  searchParams,
  actions,
}: {
  trouves: UtilisateursTrouves
  barreDeFiltres: (actions: ReactNode) => ReactNode
  searchParams: ParametresDeLaListe
  actions: ReactNode
}) => (
  <CoopPageContainer size="full">
    <SkipLinksPortal />
    <AdministrationBreadcrumbs currentPage="Utilisateurs" />
    <main id={contentId}>
      <AdministrationTitle icon="fr-icon-team-line" actions={actions}>
        Utilisateurs
      </AdministrationTitle>
      <div className="fr-border-radius--8 fr-py-8v fr-px-10v fr-background-alt--blue-france fr-mb-6v fr-col-xl-7">
        <p className="fr-text--medium fr-mb-2v">
          Rechercher dans la liste des utilisateurs inscrits
        </p>
        <RechercheDUtilisateurs searchParams={searchParams} />
      </div>
      {barreDeFiltres(
        <span className="fr-text--semi-bold">
          {trouves.matchesCount}{' '}
          {pluriel(
            trouves.matchesCount,
            'utilisateur trouvé',
            'utilisateurs trouvés',
          )}
        </span>,
      )}
      <UtilisateursTable
        utilisateurs={trouves.utilisateurs}
        state={etatDeLaTable(searchParams)}
        baseHref={BASE_HREF}
      />
      <UtilisateursPagination
        state={etatDeLaTable(searchParams)}
        baseHref={BASE_HREF}
        nombreDUtilisateurs={trouves.matchesCount}
        lignesParPage={trouves.lignesParPage}
      />
    </main>
  </CoopPageContainer>
)
