import CraEvenementForm from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/forms/CraEvenementForm'
import { CraAnimationData } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/forms/cra-animation.validation'
import { ModaleDeCreationDeTag } from '@/features/activites/ui/components/saisie/ModaleDeCreationDeTag'
import type {
  Tag,
  VisibiliteDuTagDuCra,
} from '@/features/activites/ui/presenters/saisie/tag-du-cra.presenter'
import type { DefaultValues } from '@/libraries/formulaire'
import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import { BackButtonWithModal, CoopBreadcrumbs } from '@/libraries/ui/components'
import { RequiredFieldsDisclamer } from '@/libraries/ui/form'

type CraEvenementPageProps = {
  defaultValues: DefaultValues<CraAnimationData>
  coordinateurId: string
  initialTagsOptions: Tag[]
  visibilitesDeTag: readonly VisibiliteDuTagDuCra[]
  retour?: string | undefined
}

const CraEvenementPage = ({
  defaultValues,
  coordinateurId,
  initialTagsOptions,
  visibilitesDeTag,
  retour,
}: CraEvenementPageProps) => (
  <div className="fr-container fr-container--800">
    <SkipLinksPortal />
    <CoopBreadcrumbs
      className="fr-mb-8v"
      currentPage="Enregistrer un évènement"
    />
    <BackButtonWithModal
      modalTitle="Quitter sans enregistrer"
      modalContent="Êtes-vous sur de vouloir quitter votre compe-rendu d’activité sans enregistrer ?"
    />
    <main id={contentId}>
      <h1 className="fr-h2 fr-text-title--blue-france fr-mb-2v fr-mt-4v">
        Évènement
      </h1>
      <p className="fr-text--lg">
        Événements que vous avez organisé ou auxquels vous avez participé autour
        de l'inclusion numérique.
      </p>
      <RequiredFieldsDisclamer
        className="fr-mb-12v"
        helpLink={{
          href: 'https://docs.numerique.gouv.fr/docs/94c9fa9c-32db-499f-bfed-3645ca8b4246/',
          text: 'En savoir plus sur comment compléter un CRA',
        }}
      />
      <ModaleDeCreationDeTag visibilites={visibilitesDeTag} />
      <CraEvenementForm
        defaultValues={{ ...defaultValues, coordinateurId }}
        initialTagsOptions={initialTagsOptions}
        retour={retour}
      />
    </main>
  </div>
)

export default CraEvenementPage
