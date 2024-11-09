import RequiredFieldsDisclamer from '@app/ui/components/Form/RequiredFieldsDisclamer'
import { DefaultValues } from 'react-hook-form'
import Button from '@codegouvfr/react-dsfr/Button'
import React from 'react'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import CraIndividuelForm from '@app/web/app/coop/(full-width-layout)/mes-activites/cra/individuel/CraIndividuelForm'
import { CraIndividuelData } from '@app/web/cra/CraIndividuelValidation'
import { type MostUsedBeneficiairesForSearch } from '@app/web/beneficiaire/getInitialBeneficiairesOptionsForSearch'
import { type MostUsedLieuActiviteForSearch } from '@app/web/app/lieu-activite/getInitialLieuxActiviteOptionsForSearch'

export type CraIndividuelPageData = {
  defaultValues: DefaultValues<CraIndividuelData>
  mediateurId: string
  initialBeneficiairesOptions: MostUsedBeneficiairesForSearch
  lieuxActiviteOptions: MostUsedLieuActiviteForSearch['lieuxActiviteOptions']
  retour?: string
}

const CraIndividuelPage = ({
  defaultValues,
  initialBeneficiairesOptions,
  lieuxActiviteOptions,
  mediateurId,
  retour,
}: CraIndividuelPageData) => (
  <div className="fr-container fr-container--800">
    <CoopBreadcrumbs currentPage="Enregistrer un accompagnement individuel" />
    <Button
      priority="tertiary no outline"
      size="small"
      linkProps={{
        href: '/coop',
      }}
      className="fr-mt-6v fr-mb-6v"
      iconId="fr-icon-arrow-left-line"
    >
      Retour
    </Button>
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
    />
  </div>
)

export default CraIndividuelPage
