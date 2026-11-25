import CraIndividuelForm from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/forms/CraIndividuelForm'
import { CraIndividuelData } from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/forms/cra-individuel.validation'
import type { BeneficiaireTrouveParLeCra } from '@/features/activites/action/rechercher-des-beneficiaires.key'
import { ModaleDeCreationDeTag } from '@/features/activites/ui/components/saisie/ModaleDeCreationDeTag'
import { beneficiaireDuCra } from '@/features/activites/ui/presenters/saisie/beneficiaire-du-cra.presenter'
import type { LieuDuCra } from '@/features/activites/ui/presenters/saisie/lieu-du-cra.presenter'
import type {
  Tag,
  VisibiliteDuTagDuCra,
} from '@/features/activites/ui/presenters/saisie/tag-du-cra.presenter'
import type { DefaultValues } from '@/libraries/formulaire/hooks'
import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import { BackButtonWithModal, CoopBreadcrumbs } from '@/libraries/ui/components'
import type { SelectOption } from '@/libraries/ui/form'
import { RequiredFieldsDisclamer } from '@/libraries/ui/form'

type CraIndividuelPageData = {
  defaultValues: DefaultValues<CraIndividuelData>
  mediateurId: string
  beneficiairesProposes: readonly BeneficiaireTrouveParLeCra[]
  lieuxProposes: readonly LieuDuCra[]
  initialTagsOptions: Tag[]
  dureeOptions: SelectOption[]
  visibilitesDeTag: readonly VisibiliteDuTagDuCra[]
  retour?: string | undefined
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
