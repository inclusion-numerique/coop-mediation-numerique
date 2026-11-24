import CraPartenariatForm from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/forms/CraPartenariatForm'
import { CraPartenariatData } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/forms/cra-partenariat.validation'
import { ModaleDeCreationDeTag } from '@/features/activites/ui/components/saisie/ModaleDeCreationDeTag'
import type {
  Tag,
  VisibiliteDuTagDuCra,
} from '@/features/activites/ui/presenters/saisie/tag-du-cra.presenter'
import type { DefaultValues } from '@/libraries/formulaire/use-app-form'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skipLinks'
import BackButtonWithModal from '@/libraries/ui/components/BackButtonWithModal'
import CoopBreadcrumbs from '@/libraries/ui/components/CoopBreadcrumbs'
import RequiredFieldsDisclamer from '@/libraries/ui/components/Form/RequiredFieldsDisclamer'

type CraPartenariatPageProps = {
  defaultValues: DefaultValues<CraPartenariatData>
  coordinateurId: string
  initialTagsOptions: Tag[]
  visibilitesDeTag: readonly VisibiliteDuTagDuCra[]
  retour?: string | undefined
}

const CraPartenariatPage = ({
  defaultValues,
  coordinateurId,
  initialTagsOptions,
  visibilitesDeTag,
  retour,
}: CraPartenariatPageProps) => (
  <div className="fr-container fr-container--800">
    <SkipLinksPortal />
    <CoopBreadcrumbs
      className="fr-mb-8v"
      currentPage="Enregistrer un partenariat"
    />
    <BackButtonWithModal
      modalTitle="Quitter sans enregistrer"
      modalContent="Êtes-vous sur de vouloir quitter votre compe-rendu d’activité sans enregistrer ?"
    />
    <main id={contentId}>
      <h1 className="fr-h2 fr-text-title--blue-france fr-mb-2v fr-mt-4v">
        Partenariat
      </h1>
      <p className="fr-text--lg">
        Partenariats mis en place avec les acteurs du territoire pour développer
        des collaborations et renforcer le maillage et les synergies locales.
      </p>
      <RequiredFieldsDisclamer
        className="fr-mb-12v"
        helpLink={{
          href: 'https://docs.numerique.gouv.fr/docs/94c9fa9c-32db-499f-bfed-3645ca8b4246/',
          text: 'En savoir plus sur comment compléter un CRA',
        }}
      />
      <ModaleDeCreationDeTag visibilites={visibilitesDeTag} />
      <CraPartenariatForm
        defaultValues={{ ...defaultValues, coordinateurId }}
        initialTagsOptions={initialTagsOptions}
        retour={retour}
      />
    </main>
  </div>
)

export default CraPartenariatPage
