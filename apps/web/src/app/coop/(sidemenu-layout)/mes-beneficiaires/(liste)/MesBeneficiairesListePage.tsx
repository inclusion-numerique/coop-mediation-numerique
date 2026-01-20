import Dropdown from '@app/ui/components/Dropdown/Dropdown'
import BeneficiairesTable from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/(liste)/BeneficiairesTable'
import { BeneficiairesListPageData } from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/(liste)/getBeneficiairesListPageData'
import { getBeneficiairesResultCountLabel } from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/(liste)/getBeneficiairesResultCountLabel'
import DataSearchBar from '@app/web/libs/data-table/DataSearchBar'
import Button from '@codegouvfr/react-dsfr/Button'
import Link from 'next/link'
import BeneficiairesMoreOptionsButton from './BeneficiairesMoreOptionsButton'

const MesBeneficiairesListePage = ({
  data: { searchParams, searchResult, isFiltered },
}: {
  data: BeneficiairesListPageData
}) => (
  <>
    <div className="fr-flex fr-mt-5v fr-mb-6v fr-flex-gap-4v">
      <DataSearchBar
        className="fr-flex-grow-1"
        baseHref="/coop/mes-beneficiaires"
        searchParams={searchParams}
        placeholder="Rechercher parmi vos bénéficiaires enregistrés"
      />
      <Button
        iconId="fr-icon-user-add-line"
        className="fr-ml-4v"
        linkProps={{
          href: '/coop/mes-beneficiaires/nouveau',
        }}
      >
        Créer un bénéficiaire
      </Button>
      <BeneficiairesMoreOptionsButton />
    </div>
    <hr className="fr-separator-4v" />
    <p className="fr-text--bold fr-text--lg fr-my-6v">
      {getBeneficiairesResultCountLabel({ isFiltered, searchResult })}
    </p>
    <BeneficiairesTable
      data={searchResult}
      baseHref="/coop/mes-beneficiaires"
      searchParams={searchParams}
    />
  </>
)

export default MesBeneficiairesListePage
