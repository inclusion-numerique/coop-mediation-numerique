import RequiredFieldsDisclamer from '@app/ui/components/Form/RequiredFieldsDisclamer'
import type { SelectOption } from '@app/ui/components/Form/utils/options'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import BackButtonWithModal from '@app/web/components/BackButtonWithModal'
import { MostUsedBeneficiairesForSearch } from '@app/web/features/beneficiaires/db/getInitialBeneficiairesOptionsForSearch'
import type { LieuActiviteOption } from '@app/web/features/lieux-activite/getMediateursLieuxActiviteOptions'
import React from 'react'
import type { DefaultValues } from 'react-hook-form'
import CraIndividuelForm from './components/CraIndividuelForm'
import { CraIndividuelData } from './validation/CraIndividuelValidation'

export type CraIndividuelPageData = {
  defaultValues: DefaultValues<CraIndividuelData>
  mediateurId: string
  initialBeneficiairesOptions: MostUsedBeneficiairesForSearch
  lieuxActiviteOptions: LieuActiviteOption[]
  dureeOptions: SelectOption[]
  retour?: string
}

const CraIndividuelPage = ({
  defaultValues,
  initialBeneficiairesOptions,
  lieuxActiviteOptions,
  dureeOptions,
  mediateurId,
  retour,
}: CraIndividuelPageData) => (
  <div className="fr-container fr-container--800">
    <CoopBreadcrumbs currentPage="Enregistrer un accompagnement individuel" />
    <BackButtonWithModal
      href="/coop"
      modalTitle="Quitter sans enregistrer"
      modalContent="Êtes-vous sur de vouloir quitter votre compe-rendu d’activité sans enregistrer ?"
    >
      Retour à l&apos;accueil
    </BackButtonWithModal>
    <h1 className="fr-text-title--blue-france fr-mb-2v ">
      Accompagnement individuel
    </h1>
    <RequiredFieldsDisclamer
      className="fr-mb-12v"
      helpLink={{
        href: 'https://incubateurdesterritoires.notion.site/Accompagnement-individuel-de-m-diation-num-rique-94011d45a214412981168bdd5e9d66c7',
        text: 'En savoir plus sur comment compléter un CRA',
      }}
    />

    <CraIndividuelForm
      defaultValues={{ ...defaultValues, mediateurId }}
      lieuActiviteOptions={lieuxActiviteOptions}
      initialBeneficiairesOptions={initialBeneficiairesOptions}
      retour={retour}
      dureeOptions={dureeOptions}
    />
  </div>
)

export default CraIndividuelPage
