import type { CraIndividuelData } from '@app/web/features/activites/use-cases/cra/individuel/validation/CraIndividuelValidation'
import type { DefaultValues } from 'react-hook-form'
import type { CraCollectifData } from '../features/activites/use-cases/cra/collectif/validation/CraCollectifValidation'
import { createEmptyParticipantsAnonymes } from '../features/activites/use-cases/cra/collectif/validation/participantsAnonymes'
import { getAdaptiveDureeOptions } from '../features/activites/use-cases/cra/db/getAdaptiveDureeOptions'
import {
  minutesToCraDureeData,
  minutesToCustomCraDureeData,
} from '../features/activites/use-cases/cra/db/minutesToCraDuree'
import type { RdvUserMergedBeneficiaire } from '../features/rdvsp/sync/createOrMergeBeneficiaireFromRdvUsers'
import { dateAsIsoDay } from '../utils/dateAsIsoDay'

export const createCraDataFromRdv = async ({
  rdv,
  mediateurId,
  beneficiaires,
}: {
  rdv: {
    id: number
    durationInMin: number
    name: string | null
    startsAt: Date
    endsAt: Date
    collectif: boolean
    maxParticipantsCount: number | null
    motif: {
      name: string
      collectif: boolean
    } | null
    organisation: {
      id: number
      name: string
    }
  }
  mediateurId: string
  // beneficiaires from this Rdv's participations should have been created/merged before calling this function
  beneficiaires: RdvUserMergedBeneficiaire[]
}): Promise<{
  defaultValues: DefaultValues<CraIndividuelData>
  type: 'individuel' | 'collectif'
}> => {
  const { startsAt, durationInMin, id } = rdv

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

  if (rdv.collectif) {
    const participantsAnonymes = Math.max(
      0,
      (rdv.maxParticipantsCount ?? 0) - beneficiaires.length,
    )

    const defaultValues: DefaultValues<CraCollectifData> = {
      date: dateAsIsoDay(startsAt),
      duree,
      rdvServicePublicId: id,
      titreAtelier: rdv.name ?? undefined,
      participants: beneficiaires.map((beneficiaire) => ({
        id: beneficiaire.id,
        prenom: beneficiaire.prenom,
        nom: beneficiaire.nom,
      })),
      participantsAnonymes:
        createEmptyParticipantsAnonymes(participantsAnonymes),
    }

    return {
      defaultValues,
      type: 'collectif',
    }
  }

  const defaultValues: DefaultValues<CraIndividuelData> = {
    date: dateAsIsoDay(startsAt),
    duree,
    beneficiaire: beneficiaires.at(0),
    rdvServicePublicId: id,
  }

  return {
    defaultValues,
    type: 'individuel',
  }
}
