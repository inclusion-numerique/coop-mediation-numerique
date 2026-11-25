import Button from '@codegouvfr/react-dsfr/Button'
import { BeneficiairesMoreOptionsButton } from './BeneficiairesMoreOptionsButton'
import { BeneficiairesSearch } from './BeneficiairesSearch'

export const BeneficiairesListHeader = ({ baseHref }: { baseHref: string }) => (
  <>
    <div className="fr-flex fr-mt-5v fr-mb-4v fr-flex-gap-4v">
      <BeneficiairesSearch />
      <Button
        iconId="fr-icon-user-add-line"
        className="fr-ml-4v"
        linkProps={{ href: `${baseHref}/nouveau` }}
      >
        Créer un bénéficiaire
      </Button>
      <BeneficiairesMoreOptionsButton />
    </div>
    <hr className="fr-separator-4v" />
  </>
)
