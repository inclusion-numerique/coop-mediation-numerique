import RequiredFieldsDisclamer from '@app/ui/components/Form/RequiredFieldsDisclamer'
import type { SelectOption } from '@app/ui/components/Form/utils/options'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import BackButtonWithModal from '@app/web/components/BackButtonWithModal'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import CraCollectifForm from '@app/web/features/activites/abilities/enregistrer-un-atelier-collectif/ui/components/CraCollectifForm'
import type { CraCollectifData } from '@app/web/features/activites/abilities/enregistrer-un-atelier-collectif/ui/validation/CraCollectifValidation'
import {
  type BeneficiaireTrouveParLeCra,
  beneficiaireDuCra,
} from '@app/web/features/activites/ui/saisie/beneficiaire/beneficiaire-du-cra'
import type { LieuDuCra } from '@app/web/features/activites/ui/saisie/lieu/lieu-du-cra'
import { ModaleDeCreationDeTag } from '@app/web/features/activites/ui/saisie/tags/ModaleDeCreationDeTag'
import type {
  Tag,
  VisibiliteDuTagDuCra,
} from '@app/web/features/activites/ui/saisie/tags/tag-du-cra'
import { contentId } from '@app/web/utils/skipLinks'
import type { DefaultValues } from 'react-hook-form'

export type CraCollectifPageData = {
  defaultValues: DefaultValues<CraCollectifData>
  mediateurId: string
  lieuxProposes: readonly LieuDuCra[]
  initialTagsOptions: Tag[]
  beneficiairesProposes: readonly BeneficiaireTrouveParLeCra[]
  dureeOptions: SelectOption[]
  visibilitesDeTag: readonly VisibiliteDuTagDuCra[]
  retour?: string
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
