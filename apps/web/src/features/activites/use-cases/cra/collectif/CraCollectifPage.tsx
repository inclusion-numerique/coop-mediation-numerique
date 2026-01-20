import RequiredFieldsDisclamer from '@app/ui/components/Form/RequiredFieldsDisclamer'
import type { SelectOption } from '@app/ui/components/Form/utils/options'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import BackButtonWithModal from '@app/web/components/BackButtonWithModal'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import type { MostUsedBeneficiairesForSearch } from '@app/web/features/beneficiaires/db/getInitialBeneficiairesOptionsForSearch'
import type { LieuActiviteOption } from '@app/web/features/lieux-activite/getMediateursLieuxActiviteOptions'
import { contentId } from '@app/web/utils/skipLinks'
import type { DefaultValues } from 'react-hook-form'
import { Tag } from '../../tags/components/TagsComboBox'
import SaveTagModal, { Equipe } from '../../tags/save/SaveTagModal'
import CraCollectifForm from './components/CraCollectifForm'
import type { CraCollectifData } from './validation/CraCollectifValidation'

export type CraCollectifPageData = {
  defaultValues: DefaultValues<CraCollectifData>
  mediateurId: string
  lieuxActiviteOptions: LieuActiviteOption[]
  initialTagsOptions: Tag[]
  initialBeneficiairesOptions: MostUsedBeneficiairesForSearch
  dureeOptions: SelectOption[]
  equipes: Equipe[]
  retour?: string
}

const CraCollectifPage = ({
  defaultValues,
  initialBeneficiairesOptions,
  initialTagsOptions,
  dureeOptions,
  lieuxActiviteOptions,
  mediateurId,
  equipes,
  retour,
}: CraCollectifPageData) => (
  <div className="fr-container fr-container--800">
    <SkipLinksPortal />
    <CoopBreadcrumbs currentPage="Enregistrer un atelier collectif" />
    <BackButtonWithModal
      modalTitle="Quitter sans enregistrer"
      modalContent="Êtes-vous sur de vouloir quitter votre compe-rendu d’activité sans enregistrer ?"
    />
    <main id={contentId}>
      <h1 className="fr-text-title--blue-france fr-mb-2v ">
        Atelier collectif
      </h1>
      <RequiredFieldsDisclamer
        className="fr-mb-12v"
        helpLink={{
          href: 'https://docs.numerique.gouv.fr/docs/c37dbaa4-f234-470c-8638-c91252784164/',
          text: 'En savoir plus sur comment compléter un CRA',
        }}
      />
      <SaveTagModal isMediateur isCoordinateur={false} equipes={equipes} />
      <CraCollectifForm
        defaultValues={{ ...defaultValues, mediateurId }}
        lieuActiviteOptions={lieuxActiviteOptions}
        initialBeneficiairesOptions={initialBeneficiairesOptions}
        initialTagsOptions={initialTagsOptions}
        dureeOptions={dureeOptions}
        retour={retour}
      />
    </main>
  </div>
)

export default CraCollectifPage
