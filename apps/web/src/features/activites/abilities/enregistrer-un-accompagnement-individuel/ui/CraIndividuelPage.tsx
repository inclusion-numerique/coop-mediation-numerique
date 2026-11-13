import RequiredFieldsDisclamer from '@app/ui/components/Form/RequiredFieldsDisclamer'
import type { SelectOption } from '@app/ui/components/Form/utils/options'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import BackButtonWithModal from '@app/web/components/BackButtonWithModal'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import CraIndividuelForm from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/components/CraIndividuelForm'
import { CraIndividuelData } from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/validation/CraIndividuelValidation'
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
import type { DefaultValues } from '@app/web/libs/form/use-app-form'
import { contentId } from '@app/web/utils/skipLinks'

export type CraIndividuelPageData = {
  defaultValues: DefaultValues<CraIndividuelData>
  mediateurId: string
  beneficiairesProposes: readonly BeneficiaireTrouveParLeCra[]
  lieuxProposes: readonly LieuDuCra[]
  initialTagsOptions: Tag[]
  dureeOptions: SelectOption[]
  visibilitesDeTag: readonly VisibiliteDuTagDuCra[]
  retour?: string
}

const CraIndividuelPage = ({
  defaultValues,
  beneficiairesProposes,
  initialTagsOptions,
  lieuxProposes,
  dureeOptions,
  mediateurId,
  visibilitesDeTag,
  retour,
}: CraIndividuelPageData) => (
  <div className="fr-container fr-container--800">
    <SkipLinksPortal />
    <CoopBreadcrumbs currentPage="Enregistrer un accompagnement individuel" />
    <BackButtonWithModal
      modalTitle="Quitter sans enregistrer"
      modalContent="Êtes-vous sur de vouloir quitter votre compe-rendu d’activité sans enregistrer ?"
    />
    <main id={contentId}>
      <h1 className="fr-text-title--blue-france fr-mb-2v ">
        Accompagnement individuel
      </h1>
      <RequiredFieldsDisclamer
        className="fr-mb-12v"
        helpLink={{
          href: 'https://docs.numerique.gouv.fr/docs/71878018-757b-4d89-a918-f29c8cf21bfb/',
          text: 'En savoir plus sur comment compléter un CRA',
        }}
      />
      <ModaleDeCreationDeTag visibilites={visibilitesDeTag} />
      <CraIndividuelForm
        defaultValues={{ ...defaultValues, mediateurId }}
        lieuxProposes={lieuxProposes}
        beneficiairesProposes={beneficiairesProposes.map(beneficiaireDuCra)}
        initialTagsOptions={initialTagsOptions}
        retour={retour}
        dureeOptions={dureeOptions}
      />
    </main>
  </div>
)

export default CraIndividuelPage
