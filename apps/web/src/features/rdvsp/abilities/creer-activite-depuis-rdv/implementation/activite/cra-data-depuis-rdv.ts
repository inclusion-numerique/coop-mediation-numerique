import type { CraCollectifData } from '@app/web/features/activites/use-cases/cra/collectif/validation/CraCollectifValidation'
import { createEmptyParticipantsAnonymes } from '@app/web/features/activites/use-cases/cra/collectif/validation/participantsAnonymes'
import { getAdaptiveDureeOptions } from '@app/web/features/activites/use-cases/cra/db/getAdaptiveDureeOptions'
import {
  minutesToCraDureeData,
  minutesToCustomCraDureeData,
} from '@app/web/features/activites/use-cases/cra/db/minutesToCraDuree'
import type { CraIndividuelData } from '@app/web/features/activites/use-cases/cra/individuel/validation/CraIndividuelValidation'
import type { MergedBeneficiaire } from '@app/web/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import type { DefaultValues } from 'react-hook-form'

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
  beneficiaires: MergedBeneficiaire[]
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
      // Ne pas ajouter de participants anonymes automatiquement pour les ateliers incomplets
      participantsAnonymes: createEmptyParticipantsAnonymes(0),
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
