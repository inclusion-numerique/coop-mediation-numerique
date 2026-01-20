import RequiredFieldsDisclamer from '@app/ui/components/Form/RequiredFieldsDisclamer'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import BackButtonWithModal from '@app/web/components/BackButtonWithModal'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { contentId } from '@app/web/utils/skipLinks'
import React from 'react'
import type { DefaultValues } from 'react-hook-form'
import type { Tag } from '../../tags/components/TagsComboBox'
import SaveTagModal, { Equipe } from '../../tags/save/SaveTagModal'
import { CraAnimationData } from '../animation/validation/CraAnimationValidation'
import CraEvenementForm from './components/CraEvenementForm'

type CraEvenementPageProps = {
  defaultValues: DefaultValues<CraAnimationData>
  coordinateurId: string
  initialTagsOptions: Tag[]
  equipes: Equipe[]
  retour?: string
}

const CraEvenementPage = ({
  defaultValues,
  coordinateurId,
  initialTagsOptions,
  equipes,
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
      <SaveTagModal isMediateur={false} isCoordinateur equipes={equipes} />
      <CraEvenementForm
        defaultValues={{ ...defaultValues, coordinateurId }}
        initialTagsOptions={initialTagsOptions}
        retour={retour}
      />
    </main>
  </div>
)

export default CraEvenementPage
