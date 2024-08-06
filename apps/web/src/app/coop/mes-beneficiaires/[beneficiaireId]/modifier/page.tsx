import RequiredFieldsDisclamer from '@app/ui/components/Form/RequiredFieldsDisclamer'
import { DefaultValues } from 'react-hook-form'
import { notFound } from 'next/navigation'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import { getAuthenticatedMediateur } from '@app/web/auth/getAuthenticatedMediateur'
import { CraIndividuelData } from '@app/web/cra/CraIndividuelValidation'
import { EncodedState } from '@app/web/utils/encodeSerializableState'
import IconInSquare from '@app/web/components/IconInSquare'
import BeneficiaireForm from '@app/web/app/coop/mes-beneficiaires/BeneficiaireForm'
import { prismaClient } from '@app/web/prismaClient'
import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import { BeneficiaireData } from '@app/web/beneficiaire/BeneficiaireValidation'
import { beneficiaireCommuneResidenceToPreviewBanData } from '@app/web/beneficiaire/prismaBeneficiaireToBeneficiaireData'
import { AdressBanFormFieldOption } from '@app/web/components/form/AdresseBanFormField'
import { banMunicipalityLabel } from '@app/web/external-apis/ban/banMunicipalityLabel'

const PageModifierBeneficiaire = async ({
  searchParams: { retour } = {},
  params: { beneficiaireId },
}: {
  searchParams?: {
    cra?: EncodedState<DefaultValues<CraIndividuelData>>
    retour?: string
  }
  params: { beneficiaireId: string }
}) => {
  const user = await getAuthenticatedMediateur()

  const beneficiaire = await prismaClient.beneficiaire.findUnique({
    where: {
      id: beneficiaireId,
      mediateurId: user.mediateur.id,
      suppression: null,
    },
    select: {
      id: true,
      mediateurId: true,
      prenom: true,
      nom: true,
      email: true,
      anneeNaissance: true,
      notes: true,
      genre: true,
      trancheAge: true,
      adresse: true,
      telephone: true,
      pasDeTelephone: true,
      statutSocial: true,
      dateNaissance: true,
      commune: true,
      communeCodePostal: true,
      communeCodeInsee: true,
    },
  })

  if (!beneficiaire) {
    notFound()
    return null
  }

  const displayName = getBeneficiaireDisplayName(beneficiaire)

  const {
    trancheAge,
    statutSocial,
    genre,
    adresse,
    communeCodeInsee,
    commune,
    communeCodePostal,
    anneeNaissance,
    pasDeTelephone,
    telephone,
    email,
    prenom,
    mediateurId,
    id,
    nom,
    notes,
  } = beneficiaire

  const communeResidenceData = beneficiaireCommuneResidenceToPreviewBanData({
    commune,
    communeCodeInsee,
    communeCodePostal,
  })

  const communeResidenceDefaultOptions = communeResidenceData
    ? [
        {
          label: banMunicipalityLabel(communeResidenceData),
          value: communeResidenceData,
        } satisfies AdressBanFormFieldOption,
      ]
    : undefined

  const beneficiaireDefaultValues = {
    mediateurId,
    id,
    trancheAge,
    statutSocial,
    genre,
    adresse,
    notes,
    communeResidence: communeResidenceData,
    anneeNaissance,
    pasDeTelephone,
    telephone,
    email,
    prenom: prenom ?? '',
    nom: nom ?? '',
  } satisfies DefaultValues<BeneficiaireData> & {
    id: string
    mediateurId: string
  }

  return (
    <CoopPageContainer size={794} className="fr-pt-8v">
      <CoopBreadcrumbs
        currentPage="Modifier"
        parents={[
          {
            label: 'Mes bénéficiaires',
            linkProps: {
              href: '/coop/mes-beneficiaires',
            },
          },
          {
            label: displayName,
            linkProps: { href: `/coop/mes-beneficiaires/${beneficiaire.id}` },
          },
        ]}
      />
      <div className="fr-flex fr-flex-gap-6v fr-align-items-start fr-mb-12v">
        <IconInSquare iconId="fr-icon-user-setting-line" size="large" />
        <div className="fr-flex-grow-1">
          <h1 className="fr-text-title--blue-france fr-mb-2v">{displayName}</h1>
          <RequiredFieldsDisclamer className="fr-my-0" />
        </div>
      </div>

      <BeneficiaireForm
        defaultValues={beneficiaireDefaultValues}
        retour={retour}
        communeResidenceDefaultOptions={communeResidenceDefaultOptions}
      />
    </CoopPageContainer>
  )
}

export default PageModifierBeneficiaire
