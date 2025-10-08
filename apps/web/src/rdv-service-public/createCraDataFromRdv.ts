import type { CraIndividuelData } from '@app/web/features/activites/use-cases/cra/individuel/validation/CraIndividuelValidation'
import type { DefaultValues } from 'react-hook-form'
import { CraCollectifData } from '../features/activites/use-cases/cra/collectif/validation/CraCollectifValidation'
import { getAdaptiveDureeOptions } from '../features/activites/use-cases/cra/db/getAdaptiveDureeOptions'
import {
  minutesToCraDureeData,
  minutesToCustomCraDureeData,
} from '../features/activites/use-cases/cra/db/minutesToCraDuree'
import { BeneficiaireCraData } from '../features/beneficiaires/validation/BeneficiaireValidation'
import { dateAsIsoDay } from '../utils/dateAsIsoDay'
import { SearchRdvResultItem } from '../features/activites/use-cases/list/db/searchActiviteAndRdvs'

export const createCraDataFromRdv = async ({
  rdv,
  mediateurId,
}: {
  rdv: SearchRdvResultItem
  mediateurId: string
}): Promise<{
  defaultValues: DefaultValues<CraIndividuelData>
  type: 'individuel' | 'collectif'
}> => {
  const { startsAt, durationInMin, participations, id } = rdv

  const participationBeneficiaireSuivi = participations
    .find((participation) => !!participation.user.beneficiaire)
    ?.user.beneficiaire?.at(0)

  const beneficiaire = participationBeneficiaireSuivi
    ? ({
        id: participationBeneficiaireSuivi.id,
        prenom: participationBeneficiaireSuivi.prenom,
        nom: participationBeneficiaireSuivi.nom,
      } satisfies BeneficiaireCraData)
    : undefined

  const dureeOptions = await getAdaptiveDureeOptions({
    mediateurId,
  })

  const durationInMinutesString = durationInMin.toString()

  // If rdv duration is one of the users durée options, we use it
  const existingDureeOption = dureeOptions.find(
    (option) => option.value === durationInMinutesString,
  )

  // Else we use a "personnaliser" option
  const duree = existingDureeOption
    ? (minutesToCraDureeData(durationInMin) ?? undefined)
    : minutesToCustomCraDureeData(durationInMin)

  if (rdv.motif?.collectif) {
    const defaultValues: DefaultValues<CraCollectifData> = {
      date: dateAsIsoDay(startsAt),
      duree,
      rdvServicePublicId: id,
      titreAtelier: rdv.name ?? undefined,
    }

    return {
      defaultValues,
      type: 'collectif',
    }
  }

  const defaultValues: DefaultValues<CraIndividuelData> = {
    date: dateAsIsoDay(startsAt),
    duree,
    beneficiaire,
    rdvServicePublicId: id,
  }

  return {
    defaultValues,
    type: 'individuel',
  }
}
