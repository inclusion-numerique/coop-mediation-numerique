import CraDemarcheAdministrativePage from '@app/web/app/coop/(full-width-layout)/mes-activites/cra/administratif/CraDemarcheAdministrativePage'
import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { getInitialBeneficiairesOptionsForSearch } from '@app/web/beneficiaire/getInitialBeneficiairesOptionsForSearch'
import { CraDemarcheAdministrativeData } from '@app/web/cra/CraDemarcheAdministrativeValidation'
import { getAdaptiveDureeOptions } from '@app/web/cra/getAdaptiveDureeOptions'
import { banDefaultValueToAdresseBanData } from '@app/web/external-apis/ban/banDefaultValueToAdresseBanData'
import { getMediateursLieuxActiviteOptions } from '@app/web/features/lieux-activite/getMediateursLieuxActiviteOptions'
import {
  EncodedState,
  decodeSerializableState,
} from '@app/web/utils/encodeSerializableState'
import { DefaultValues } from 'react-hook-form'

const CreateCraDemarcheAdministrativePage = async ({
  searchParams: { v, retour } = {},
}: {
  searchParams?: {
    v?: EncodedState<DefaultValues<CraDemarcheAdministrativeData>>
    retour?: string
  }
}) => {
  const user = await authenticateMediateur()

  const urlFormState = v ? decodeSerializableState(v, {}) : {}

  // delete sensitive data from urlFormState
  delete urlFormState.mediateurId

  const defaultValues: DefaultValues<CraDemarcheAdministrativeData> & {
    mediateurId: string
  } = {
    ...urlFormState,
    date: urlFormState.date ?? new Date().toISOString().slice(0, 10),
    mediateurId: user.mediateur.id,
    beneficiaire: {
      // Could be from another mediateur ? is it safe ? check will be backend ?
      mediateurId: user.mediateur.id,
      ...urlFormState.beneficiaire,
    },
    duree: urlFormState.duree ?? {},
    // If no value for domicile usager, then default to beneficiaire adresse
    lieuCommuneData:
      urlFormState.lieuCommuneData ??
      (urlFormState.beneficiaire?.communeResidence
        ? banDefaultValueToAdresseBanData(
            urlFormState.beneficiaire.communeResidence,
          )
        : null),
  }

  const lieuxActiviteOptions = await getMediateursLieuxActiviteOptions({
    mediateurIds: [user.mediateur.id],
  })

  if (!defaultValues.structureId) {
    defaultValues.structureId = lieuxActiviteOptions.at(0)?.value ?? undefined
  }

  const initialBeneficiairesOptions =
    await getInitialBeneficiairesOptionsForSearch({
      mediateurId: user.mediateur.id,
      includeBeneficiaireIds: defaultValues.beneficiaire?.id
        ? [defaultValues.beneficiaire.id]
        : [],
    })

  const dureeOptions = await getAdaptiveDureeOptions({
    mediateurId: user.mediateur.id,
    include: defaultValues.duree?.duree,
  })

  return (
    <CraDemarcheAdministrativePage
      defaultValues={defaultValues}
      mediateurId={user.mediateur.id}
      lieuxActiviteOptions={lieuxActiviteOptions}
      initialBeneficiairesOptions={initialBeneficiairesOptions}
      dureeOptions={dureeOptions}
      retour={retour}
    />
  )
}

export default CreateCraDemarcheAdministrativePage
