import RequiredFieldsDisclamer from '@app/ui/components/Form/RequiredFieldsDisclamer'
import type { SelectOption } from '@app/ui/components/Form/utils/options'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import BackButtonWithModal from '@app/web/components/BackButtonWithModal'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { contentId } from '@app/web/utils/skipLinks'
import React from 'react'
import type { DefaultValues } from 'react-hook-form'
import type { Tag } from '../../tags/components/TagsComboBox'
import SaveTagModal from '../../tags/save/SaveTagModal'
import CraAnimationForm from './components/CraAnimationForm'
import { CraAnimationData } from './validation/CraAnimationValidation'

type CraAnimationPageProps = {
  defaultValues: DefaultValues<CraAnimationData>
  coordinateurId: string
  dureeOptions: SelectOption[]
  initialTagsOptions: Tag[]
  retour?: string
}

const CraAnimationPage = ({
  defaultValues,
  coordinateurId,
  dureeOptions,
  initialTagsOptions,
  retour,
}: CraAnimationPageProps) => (
  <div className="fr-container fr-container--800">
    <SkipLinksPortal />
    <CoopBreadcrumbs
      className="fr-mb-8v"
      currentPage="Enregistrer un accompagnement structure(s)"
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
        Animation (aide, réunion, moment d’échange...)
      </h1>
      <p className="fr-text--lg">
        Soutenir au quotidien les professionnels de la médiation numérique et
        leurs structures en leur apportant des informations clés.
      </p>
      <RequiredFieldsDisclamer
        className="fr-mb-12v wip"
        helpLink={{
          href: 'https://docs.numerique.gouv.fr/docs/',
          text: 'En savoir plus sur comment compléter un CRA',
        }}
      />
      <SaveTagModal isMediateur={false} isCoordinateur />
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
