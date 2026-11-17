import CoopBreadcrumbs from '@/app/coop/CoopBreadcrumbs'
import BackButtonWithModal from '@/components/BackButtonWithModal'
import SkipLinksPortal from '@/components/SkipLinksPortal'
import CraAnimationForm from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/animation/components/CraAnimationForm'
import { CraAnimationData } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/animation/validation/CraAnimationValidation'
import { ModaleDeCreationDeTag } from '@/features/activites/ui/saisie/tags/ModaleDeCreationDeTag'
import type {
  Tag,
  VisibiliteDuTagDuCra,
} from '@/features/activites/ui/saisie/tags/tag-du-cra'
import RequiredFieldsDisclamer from '@/libraries/ui/components/Form/RequiredFieldsDisclamer'
import type { SelectOption } from '@/libraries/ui/components/Form/utils/options'
import type { DefaultValues } from '@/libs/form/use-app-form'
import { contentId } from '@/utils/skipLinks'

type CraAnimationPageProps = {
  defaultValues: DefaultValues<CraAnimationData>
  coordinateurId: string
  dureeOptions: SelectOption[]
  initialTagsOptions: Tag[]
  visibilitesDeTag: readonly VisibiliteDuTagDuCra[]
  retour?: string
}

const CraAnimationPage = ({
  defaultValues,
  coordinateurId,
  dureeOptions,
  initialTagsOptions,
  visibilitesDeTag,
  retour,
}: CraAnimationPageProps) => (
  <div className="fr-container fr-container--800">
    <SkipLinksPortal />
    <CoopBreadcrumbs
      className="fr-mb-8v"
      currentPage="Enregistrer une animation"
    />

    <BackButtonWithModal
      modalTitle="Quitter sans enregistrer"
      modalContent="Êtes-vous sur de vouloir quitter votre compe-rendu d’activité sans enregistrer ?"
    />

    <main id={contentId}>
      <h1 className="fr-h2 fr-text-title--blue-france fr-mb-2v fr-mt-4v">
        Animation (aide, réunion, moment d’échange...)
      </h1>
      <p className="fr-text--lg">
        Soutenir au quotidien les professionnels de la médiation numérique et
        leurs structures en leur apportant des informations clés.
      </p>
      <RequiredFieldsDisclamer
        className="fr-mb-12v"
        helpLink={{
          href: 'https://docs.numerique.gouv.fr/docs/94c9fa9c-32db-499f-bfed-3645ca8b4246/',
          text: 'En savoir plus sur comment compléter un CRA',
        }}
      />
      <ModaleDeCreationDeTag visibilites={visibilitesDeTag} />
      <CraAnimationForm
        defaultValues={{ ...defaultValues, coordinateurId }}
        dureeOptions={dureeOptions}
        initialTagsOptions={initialTagsOptions}
        retour={retour}
      />
    </main>
  </div>
)

export default CraAnimationPage
