import RequiredFieldsDisclamer from '@app/ui/components/Form/RequiredFieldsDisclamer'
import type { SelectOption } from '@app/ui/components/Form/utils/options'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import BackButtonWithModal from '@app/web/components/BackButtonWithModal'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import type { MostUsedBeneficiairesForSearch } from '@app/web/features/beneficiaires/db/getInitialBeneficiairesOptionsForSearch'
import type { LieuActiviteOption } from '@app/web/features/lieux-activite/getMediateursLieuxActiviteOptions'
import { contentId } from '@app/web/utils/skipLinks'
import React from 'react'
import type { DefaultValues } from 'react-hook-form'
import type { Tag } from '../../tags/components/TagsComboBox'
import SaveTagModal, { Equipe } from '../../tags/save/SaveTagModal'
import CraIndividuelForm from './components/CraIndividuelForm'
import { CraIndividuelData } from './validation/CraIndividuelValidation'

export type CraIndividuelPageData = {
  defaultValues: DefaultValues<CraIndividuelData>
  mediateurId: string
  initialBeneficiairesOptions: MostUsedBeneficiairesForSearch
  lieuxActiviteOptions: LieuActiviteOption[]
  initialTagsOptions: Tag[]
  dureeOptions: SelectOption[]
  equipes: Equipe[]
  retour?: string
}

const CraIndividuelPage = ({
  defaultValues,
  initialBeneficiairesOptions,
  initialTagsOptions,
  lieuxActiviteOptions,
  dureeOptions,
  mediateurId,
  equipes,
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
      <SaveTagModal isMediateur isCoordinateur={false} equipes={equipes} />
      <CraIndividuelForm
        defaultValues={{ ...defaultValues, mediateurId }}
        lieuActiviteOptions={lieuxActiviteOptions}
        initialBeneficiairesOptions={initialBeneficiairesOptions}
        initialTagsOptions={initialTagsOptions}
        retour={retour}
        dureeOptions={dureeOptions}
      />
    </main>
  </div>
)

export default CraIndividuelPage
