import CraIndividuelPage from '@app/web/app/coop/(full-width-layout)/mes-activites/cra/individuel/CraIndividuelPage'
import { getLieuxActiviteOptions } from '@app/web/app/lieu-activite/getLieuxActiviteOptions'
import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { getInitialBeneficiairesOptionsForSearch } from '@app/web/beneficiaire/getInitialBeneficiairesOptionsForSearch'
import type { CraIndividuelData } from '@app/web/cra/CraIndividuelValidation'
import { getAdaptiveDureeOptions } from '@app/web/cra/getAdaptiveDureeOptions'
import { banDefaultValueToAdresseBanData } from '@app/web/external-apis/ban/banDefaultValueToAdresseBanData'
import {
  type EncodedState,
  decodeSerializableState,
} from '@app/web/utils/encodeSerializableState'
import type { DefaultValues } from 'react-hook-form'

const CreateCraIndividuelPage = async ({
  searchParams: { v, retour } = {},
}: {
  searchParams?: {
    v?: EncodedState<DefaultValues<CraIndividuelData>>
    retour?: string
  }
}) => {
  const user = await authenticateMediateur()

  const urlFormState = v ? decodeSerializableState(v, {}) : {}

  // delete sensitive data from urlFormState
  delete urlFormState.mediateurId

  const defaultValues: DefaultValues<CraIndividuelData> & {
    mediateurId: string
  } = {
    ...urlFormState,
    date: new Date().toISOString().slice(0, 10),
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

  const lieuxActiviteOptions = await getLieuxActiviteOptions({
    mediateurIds: [user.mediateur.id],
  })

  if (!defaultValues.structureId) {
    defaultValues.structureId = lieuxActiviteOptions.at(0)?.value ?? undefined
  }

  const initialBeneficiairesOptions =
    await getInitialBeneficiairesOptionsForSearch({
      mediateurId: user.mediateur.id,
    })

  const dureeOptions = await getAdaptiveDureeOptions({
    mediateurId: user.mediateur.id,
    include: defaultValues.duree?.duree,
  })

  return (
    <CraIndividuelPage
      lieuxActiviteOptions={lieuxActiviteOptions}
      initialBeneficiairesOptions={initialBeneficiairesOptions}
      mediateurId={user.mediateur.id}
      defaultValues={defaultValues}
      dureeOptions={dureeOptions}
      retour={retour}
    />
  )
}

export default CreateCraIndividuelPage
