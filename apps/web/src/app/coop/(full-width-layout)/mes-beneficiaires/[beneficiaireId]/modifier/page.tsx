import { modifierBeneficiaireAction } from '@app/web/app/_actions/beneficiaire/modifier-beneficiaire.action'
import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import { beneficiaireCommuneResidenceToPreviewBanData } from '@app/web/beneficiaire/prismaBeneficiaireToBeneficiaireData'
import type { AdressBanFormFieldOption } from '@app/web/components/form/AdresseBanFormField'
import { banMunicipalityLabel } from '@app/web/external-apis/ban/banMunicipalityLabel'
import type { CraIndividuelData } from '@app/web/features/activites/use-cases/cra/individuel/validation/CraIndividuelValidation'
import { ModifierBeneficiairePage } from '@app/web/features/beneficiaire/abilities/modifier-beneficiaire/ui/pages/ModifierBeneficiairePage'
import type { BeneficiaireData } from '@app/web/features/beneficiaires/validation/BeneficiaireValidation'
import { prismaClient } from '@app/web/prismaClient'
import type { EncodedState } from '@app/web/utils/encodeSerializableState'
import { notFound } from 'next/navigation'
import type { DefaultValues } from 'react-hook-form'

// Route = orchestration : authentifie, lit le bénéficiaire, construit les
// valeurs par défaut du formulaire, lie l'action de modification, puis délègue
// le rendu au composant de page de la feature.
const PageModifierBeneficiaire = async (props: {
  searchParams: Promise<{
    cra?: EncodedState<DefaultValues<CraIndividuelData>>
    retour?: string
  }>
  params: Promise<{ beneficiaireId: string }>
}) => {
  const { beneficiaireId } = await props.params
  const { retour } = await props.searchParams

  const user = await authenticateMediateur()

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
    <ModifierBeneficiairePage
      beneficiaireId={beneficiaire.id}
      displayName={displayName}
      defaultValues={beneficiaireDefaultValues}
      save={modifierBeneficiaireAction}
      retour={retour}
      communeResidenceDefaultOptions={communeResidenceDefaultOptions}
    />
  )
}

export default PageModifierBeneficiaire
