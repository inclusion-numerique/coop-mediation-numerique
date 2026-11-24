import type { ReactNode } from 'react'
import { PiedDeListe } from '@/libraries/etat-d-url/liste/PiedDeListe'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skip-links'
import { pluriel } from '@/libraries/pluriel'
import AdministrationBreadcrumbs from '@/libraries/ui/components/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@/libraries/ui/components/administration/AdministrationTitle'
import CoopPageContainer from '@/libraries/ui/components/CoopPageContainer'
import type { UtilisateursTrouves } from '../../domain'
import { RechercheDUtilisateurs } from '../components/RechercheDUtilisateurs'
import { UtilisateursTable } from '../components/UtilisateursTable'
import { paginationDesUtilisateurs } from '../filtres/liste-des-utilisateurs.filtre'
import type { LiensDeLaListe } from '../presenters/liste-des-utilisateurs.presenter'

export const UtilisateursPage = ({
  trouves,
  barreDeFiltres,
  liens,
  actions,
}: {
  trouves: UtilisateursTrouves
  barreDeFiltres: (actions: ReactNode) => ReactNode
  liens: LiensDeLaListe
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
        <RechercheDUtilisateurs />
      </div>
      {barreDeFiltres(
        <span className="fr-text--semi-bold">
          {trouves.totalItems}{' '}
          {pluriel(
            trouves.totalItems,
            'utilisateur trouvé',
            'utilisateurs trouvés',
          )}
        </span>,
      )}
      <UtilisateursTable
        utilisateurs={trouves.items}
        colonnes={liens.colonnes}
      />
      <PiedDeListe liens={liens.pages} pagination={paginationDesUtilisateurs} />
    </main>
  </CoopPageContainer>
)
