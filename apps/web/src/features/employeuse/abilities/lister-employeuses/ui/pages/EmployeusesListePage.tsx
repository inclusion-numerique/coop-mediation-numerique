import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { pluriel } from '@app/web/libraries/pluriel'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { contentId } from '@app/web/utils/skipLinks'
import EmployeusesTable from '../EmployeusesTable'
import type { EmployeuseAffichee } from '../employeuse-affichee.presenter'
import type { EmployeusesSearchParams } from '../employeuses.data-table'
import RechercheEmployeuses from '../RechercheEmployeuses'

const baseHref = '/administration/structures-employeuses'

const EmployeusesListePage = ({
  employeuses,
  trouvees,
  pages,
  searchParams,
}: {
  employeuses: EmployeuseAffichee[]
  trouvees: number
  pages: number
  searchParams: EmployeusesSearchParams
}) => (
  <CoopPageContainer size="full">
    <SkipLinksPortal />
    <AdministrationBreadcrumbs currentPage="Structures employeuses" />
    <main id={contentId}>
      <AdministrationTitle icon="fr-icon-building-line">
        Structures employeuses
      </AdministrationTitle>
      <div className="fr-border-radius--8 fr-py-8v fr-px-10v fr-background-alt--blue-france fr-mb-6v fr-col-xl-7">
        <p className="fr-text--medium fr-mb-2v">
          Rechercher dans la liste des structures employeuses
        </p>
        <RechercheEmployeuses searchParams={searchParams} />
      </div>
      <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-mb-6v">
        <span className="fr-text--semi-bold">
          {trouvees}{' '}
          {pluriel(
            trouvees,
            'structure employeuse trouvée',
            'structures employeuses trouvées',
          )}
        </span>
      </div>
      <EmployeusesTable
        employeuses={employeuses}
        pages={pages}
        searchParams={searchParams}
        baseHref={baseHref}
      />
    </main>
  </CoopPageContainer>
)

export default EmployeusesListePage
