import CraCollectifForm from '@/features/activites/abilities/enregistrer-un-atelier-collectif/ui/forms/CraCollectifForm'
import type { CraCollectifData } from '@/features/activites/abilities/enregistrer-un-atelier-collectif/ui/forms/cra-collectif.validation'
import type { BeneficiaireTrouveParLeCra } from '@/features/activites/action/rechercher-des-beneficiaires.key'
import { ModaleDeCreationDeTag } from '@/features/activites/ui/components/saisie/ModaleDeCreationDeTag'
import { beneficiaireDuCra } from '@/features/activites/ui/presenters/saisie/beneficiaire-du-cra.presenter'
import type { LieuDuCra } from '@/features/activites/ui/presenters/saisie/lieu-du-cra.presenter'
import type {
  Tag,
  VisibiliteDuTagDuCra,
} from '@/features/activites/ui/presenters/saisie/tag-du-cra.presenter'
import type { DefaultValues } from '@/libraries/formulaire/use-app-form'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skip-links'
import BackButtonWithModal from '@/libraries/ui/components/BackButtonWithModal'
import CoopBreadcrumbs from '@/libraries/ui/components/CoopBreadcrumbs'
import RequiredFieldsDisclamer from '@/libraries/ui/components/form/RequiredFieldsDisclamer'
import type { SelectOption } from '@/libraries/ui/components/form/utils/options'

type CraCollectifPageData = {
  defaultValues: DefaultValues<CraCollectifData>
  mediateurId: string
  lieuxProposes: readonly LieuDuCra[]
  initialTagsOptions: Tag[]
  beneficiairesProposes: readonly BeneficiaireTrouveParLeCra[]
  dureeOptions: SelectOption[]
  visibilitesDeTag: readonly VisibiliteDuTagDuCra[]
  retour?: string | undefined
}

const CraCollectifPage = ({
  defaultValues,
  beneficiairesProposes,
  initialTagsOptions,
  dureeOptions,
  lieuxProposes,
  mediateurId,
  visibilitesDeTag,
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
      <ModaleDeCreationDeTag visibilites={visibilitesDeTag} />
      <CraCollectifForm
        defaultValues={{ ...defaultValues, mediateurId }}
        lieuxProposes={lieuxProposes}
        beneficiairesProposes={beneficiairesProposes.map(beneficiaireDuCra)}
        initialTagsOptions={initialTagsOptions}
        dureeOptions={dureeOptions}
        retour={retour}
      />
    </main>
  </div>
)

export default CraCollectifPage
