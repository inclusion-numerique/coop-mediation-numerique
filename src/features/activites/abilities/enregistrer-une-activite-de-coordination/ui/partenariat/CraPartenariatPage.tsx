import CoopBreadcrumbs from '@/app/coop/CoopBreadcrumbs'
import BackButtonWithModal from '@/components/BackButtonWithModal'
import SkipLinksPortal from '@/components/SkipLinksPortal'
import CraPartenariatForm from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/partenariat/components/CraPartenariatForm'
import { CraPartenariatData } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/partenariat/validation/CraPartenariatValidation'
import { ModaleDeCreationDeTag } from '@/features/activites/ui/saisie/tags/ModaleDeCreationDeTag'
import type {
  Tag,
  VisibiliteDuTagDuCra,
} from '@/features/activites/ui/saisie/tags/tag-du-cra'
import RequiredFieldsDisclamer from '@/libraries/ui/components/Form/RequiredFieldsDisclamer'
import type { DefaultValues } from '@/libs/form/use-app-form'
import { contentId } from '@/utils/skipLinks'

type CraPartenariatPageProps = {
  defaultValues: DefaultValues<CraPartenariatData>
  coordinateurId: string
  initialTagsOptions: Tag[]
  visibilitesDeTag: readonly VisibiliteDuTagDuCra[]
  retour?: string
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
