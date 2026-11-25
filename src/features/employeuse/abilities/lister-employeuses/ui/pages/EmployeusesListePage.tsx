import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import { pluriel } from '@/libraries/pluriel'
import {
  AdministrationBreadcrumbs,
  AdministrationTitle,
  CoopPageContainer,
} from '@/libraries/ui/components'
import EmployeusesTable from '../components/EmployeusesTable'
import RechercheEmployeuses from '../components/RechercheEmployeuses'
import {
  type BarreDesEmployeuses,
  CHEMIN_DES_EMPLOYEUSES,
} from '../presenters/barre-des-employeuses.presenter'
import type { EmployeuseAffichee } from '../presenters/employeuse-affichee.presenter'

const EmployeusesListePage = ({
  employeuses,
  trouvees,
  barre,
}: {
  employeuses: EmployeuseAffichee[]
  trouvees: number
  barre: BarreDesEmployeuses
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
        <RechercheEmployeuses />
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
        barre={barre}
        baseHref={CHEMIN_DES_EMPLOYEUSES}
      />
    </main>
  </CoopPageContainer>
)

export default EmployeusesListePage
