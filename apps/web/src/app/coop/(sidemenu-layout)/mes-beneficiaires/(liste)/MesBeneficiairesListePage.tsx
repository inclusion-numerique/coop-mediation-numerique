import { BeneficiairesListPageData } from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/(liste)/getBeneficiairesListPageData'
import DataSearchBar from '@app/web/libs/data-table/DataSearchBar'
import Button from '@codegouvfr/react-dsfr/Button'
import BeneficiairesMoreOptionsButton from './BeneficiairesMoreOptionsButton'
import SelectableBeneficiairesTable from './SelectableBeneficiairesTable'

const MesBeneficiairesListePage = ({
  data: { searchParams, searchResult, isFiltered },
}: {
  data: BeneficiairesListPageData
}) => (
  <>
    <div className="fr-flex fr-mt-5v fr-mb-4v fr-flex-gap-4v">
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
    <SelectableBeneficiairesTable
      data={searchResult}
      baseHref="/coop/mes-beneficiaires"
      searchParams={searchParams}
      isFiltered={isFiltered}
    />
  </>
)

export default MesBeneficiairesListePage
