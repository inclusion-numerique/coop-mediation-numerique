import RequiredFieldsDisclamer from '@app/ui/components/Form/RequiredFieldsDisclamer'
import type { SelectOption } from '@app/ui/components/Form/utils/options'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import BackButtonWithModal from '@app/web/components/BackButtonWithModal'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import type { MostUsedBeneficiairesForSearch } from '@app/web/features/beneficiaires/db/getInitialBeneficiairesOptionsForSearch'
import type { LieuActiviteOption } from '@app/web/features/lieux-activite/getMediateursLieuxActiviteOptions'
import { contentId } from '@app/web/utils/skipLinks'
import type { DefaultValues } from 'react-hook-form'
import CraCollectifForm from './components/CraCollectifForm'
import type { CraCollectifData } from './validation/CraCollectifValidation'

export type CraCollectifPageData = {
  defaultValues: DefaultValues<CraCollectifData>
  mediateurId: string
  lieuxActiviteOptions: LieuActiviteOption[]
  initialBeneficiairesOptions: MostUsedBeneficiairesForSearch
  dureeOptions: SelectOption[]
  retour?: string
}

const CraCollectifPage = ({
  defaultValues,
  initialBeneficiairesOptions,
  dureeOptions,
  lieuxActiviteOptions,
  mediateurId,
  retour,
}: CraCollectifPageData) => (
  <div className="fr-container fr-container--800">
    <SkipLinksPortal />
    <CoopBreadcrumbs currentPage="Enregistrer un atelier collectif" />
    <BackButtonWithModal
      href="/coop"
      modalTitle="Quitter sans enregistrer"
      modalContent="Êtes-vous sur de vouloir quitter votre compe-rendu d’activité sans enregistrer ?"
    >
      Retour à l&apos;accueil
    </BackButtonWithModal>
    <main id={contentId}>
      <h1 className="fr-text-title--blue-france fr-mb-2v ">
        Atelier collectif
      </h1>
      <RequiredFieldsDisclamer
        className="fr-mb-12v"
        helpLink={{
          href: 'https://incubateurdesterritoires.notion.site/Atelier-collectif-f2c9b66bd15a4c31b00343ee583a8832',
          text: 'En savoir plus sur comment compléter un CRA',
        }}
      />

      <CraCollectifForm
        defaultValues={{ ...defaultValues, mediateurId }}
        lieuActiviteOptions={lieuxActiviteOptions}
        initialBeneficiairesOptions={initialBeneficiairesOptions}
        initialCommunesOptions={[]}
        dureeOptions={dureeOptions}
        retour={retour}
      />
    </main>
  </div>
)

export default CraCollectifPage
