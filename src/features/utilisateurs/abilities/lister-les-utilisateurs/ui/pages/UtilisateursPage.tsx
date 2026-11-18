import type { ReactNode } from 'react'
import type { FiltresUtilisateurs } from '@/features/utilisateurs/domain'
import {
  libellesDesFiltres,
  type OptionsDesFiltres,
} from '@/features/utilisateurs/ui'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skipLinks'
import { pluriel } from '@/libraries/pluriel'
import AdministrationBreadcrumbs from '@/libraries/ui/components/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@/libraries/ui/components/administration/AdministrationTitle'
import type { UtilisateursTrouves } from '../../domain'
import { EtiquettesDesFiltres } from '../filtres/EtiquettesDesFiltres'
import { Filtres } from '../filtres/Filtres'
import { RechercheDUtilisateurs } from '../RechercheDUtilisateurs'
import type { UtilisateursDataTableSearchParams } from '../UtilisateursDataTable'
import { UtilisateursTable } from '../UtilisateursTable'

export const UtilisateursPage = ({
  trouves,
  filtres,
  options,
  searchParams,
  actions,
}: {
  trouves: UtilisateursTrouves
  filtres: FiltresUtilisateurs
  options: OptionsDesFiltres
  searchParams: UtilisateursDataTableSearchParams
  actions: ReactNode
}) => (
  <>
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
      <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-mb-6v">
        <Filtres filtres={filtres} options={options} />
        <span className="fr-text--semi-bold">
          {trouves.matchesCount}{' '}
          {pluriel(
            trouves.matchesCount,
            'utilisateur trouvé',
            'utilisateurs trouvés',
          )}
        </span>
      </div>
      <EtiquettesDesFiltres libelles={libellesDesFiltres(filtres, options)} />
      <UtilisateursTable
        utilisateurs={trouves.utilisateurs}
        totalPages={trouves.totalPages}
        searchParams={searchParams}
        baseHref="/administration/utilisateurs"
      />
    </main>
  </>
)
