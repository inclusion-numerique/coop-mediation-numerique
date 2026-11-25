import { PiedDeListe } from '@/libraries/etat-d-url/liste'
import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import { pluriel } from '@/libraries/pluriel'
import {
  AdministrationBreadcrumbs,
  AdministrationTitle,
  CoopPageContainer,
} from '@/libraries/ui/components'
import type { PageDeLieux } from '../../domain/ligne-de-la-liste'
import { LieuxTable } from '../components/LieuxTable'
import { RechercheDeLieux } from '../components/RechercheDeLieux'
import {
  type LiensDeLaListe,
  paginationDesLieux,
} from '../filtres/liste-des-lieux.filtre'

export const LieuxPage = ({
  lieux,
  liens,
}: {
  lieux: PageDeLieux
  liens: LiensDeLaListe
}) => (
  <CoopPageContainer size="full">
    <SkipLinksPortal />
    <AdministrationBreadcrumbs currentPage="Lieux d’activité" />
    <main id={contentId}>
      <AdministrationTitle icon="fr-icon-home-4-line">
        Lieux d’activité
      </AdministrationTitle>
      <div className="fr-border-radius--8 fr-py-8v fr-px-10v fr-background-alt--blue-france fr-mb-6v fr-col-xl-7">
        <p className="fr-text--medium fr-mb-2v">
          Rechercher dans la liste des lieux d’activité ({lieux.totalCount} au
          total)
        </p>
        <RechercheDeLieux />
      </div>
      <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-mb-6v">
        <span className="fr-text--semi-bold">
          {lieux.totalItems}{' '}
          {pluriel(
            lieux.totalItems,
            'lieu d’activité trouvé',
            'lieux d’activité trouvés',
          )}
        </span>
      </div>
      <LieuxTable lignes={lieux.items} colonnes={liens.colonnes} />
      <PiedDeListe liens={liens.pages} pagination={paginationDesLieux} />
    </main>
  </CoopPageContainer>
)
