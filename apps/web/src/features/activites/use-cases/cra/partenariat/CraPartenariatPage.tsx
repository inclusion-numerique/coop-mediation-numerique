import RequiredFieldsDisclamer from '@app/ui/components/Form/RequiredFieldsDisclamer'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import BackButtonWithModal from '@app/web/components/BackButtonWithModal'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { contentId } from '@app/web/utils/skipLinks'
import React from 'react'
import type { DefaultValues } from 'react-hook-form'
import type { Tag } from '../../tags/components/TagsComboBox'
import SaveTagModal from '../../tags/save/SaveTagModal'
import CraPartenariatForm from './components/CraPartenariatForm'
import { CraPartenariatData } from './validation/CraPartenariatValidation'

type CraPartenariatPageProps = {
  defaultValues: DefaultValues<CraPartenariatData>
  coordinateurId: string
  initialTagsOptions: Tag[]
  retour?: string
}

const CraPartenariatPage = ({
  defaultValues,
  coordinateurId,
  initialTagsOptions,
  retour,
}: CraPartenariatPageProps) => (
  <div className="fr-container fr-container--800">
    <SkipLinksPortal />
    <CoopBreadcrumbs
      className="fr-mb-8v"
      currentPage="Enregistrer un partenariat"
    />
    <BackButtonWithModal
      href="/coop"
      modalTitle="Quitter sans enregistrer"
      modalContent="Êtes-vous sur de vouloir quitter votre compe-rendu d’activité sans enregistrer ?"
    >
      Retour
    </BackButtonWithModal>
    <main id={contentId}>
      <h1 className="fr-h2 fr-text-title--blue-france fr-mb-2v fr-mt-4v">
        Partenariat
      </h1>
      <p className="fr-text--lg">
        Partenariats mis en place avec les acteurs du territoire pour développer
        des collaborations et renforcer le maillage et les synergies locales.
      </p>
      <RequiredFieldsDisclamer
        className="fr-mb-12v wip"
        helpLink={{
          href: 'https://docs.numerique.gouv.fr/docs/',
          text: 'En savoir plus sur comment compléter un CRA',
        }}
      />
      <SaveTagModal isMediateur={false} isCoordinateur />
      <CraPartenariatForm
        defaultValues={{ ...defaultValues, coordinateurId }}
        initialTagsOptions={initialTagsOptions}
        retour={retour}
      />
    </main>
  </div>
)

export default CraPartenariatPage
