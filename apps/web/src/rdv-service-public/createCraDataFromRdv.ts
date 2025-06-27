import type { CraIndividuelData } from '@app/web/features/activites/use-cases/cra/individuel/validation/CraIndividuelValidation'
import type { DefaultValues } from 'react-hook-form'
import { MediateurUser } from '../auth/userTypeGuards'
import { getAdaptiveDureeOptions } from '../features/activites/use-cases/cra/db/getAdaptiveDureeOptions'
import {
  minutesToCraDureeData,
  minutesToCustomCraDureeData,
} from '../features/activites/use-cases/cra/db/minutesToCraDuree'
import { BeneficiaireCraData } from '../features/beneficiaires/validation/BeneficiaireValidation'
import { dateAsIsoDay } from '../utils/dateAsIsoDay'
import type { Rdv } from './Rdv'

export const createCraDataFromRdv = async ({
  rdv,
  mediateurId,
}: {
  rdv: Rdv
  mediateurId: string
}): Promise<DefaultValues<CraIndividuelData>> => {
  const { date, durationInMinutes, participations, id } = rdv

  const participationBeneficiaireSuivi = participations.find(
    (participation) => !!participation.user.beneficiaire,
  )?.user.beneficiaire

  const beneficiaire = participationBeneficiaireSuivi
    ? ({
        id: participationBeneficiaireSuivi.id,
        prenom: participationBeneficiaireSuivi.prenom,
        nom: participationBeneficiaireSuivi.nom,
        mediateurId: participationBeneficiaireSuivi.mediateurId,
      } satisfies BeneficiaireCraData)
    : undefined

  const dureeOptions = await getAdaptiveDureeOptions({
    mediateurId,
  })

  const durationInMinutesString = durationInMinutes.toString()

  // If rdv duration is one of the users durée options, we use it
  const existingDureeOption = dureeOptions.find(
    (option) => option.value === durationInMinutesString,
  )

  // Else we use a "personnaliser" option
  const duree = existingDureeOption
    ? (minutesToCraDureeData(durationInMinutes) ?? undefined)
    : minutesToCustomCraDureeData(durationInMinutes)

  const defaultValues: DefaultValues<CraIndividuelData> = {
    date: dateAsIsoDay(date),
    duree,
    beneficiaire,
    rdvServicePublicId: id,
  }

  return defaultValues
}
