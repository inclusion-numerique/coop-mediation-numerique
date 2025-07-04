import { createParticipantsAnonymesForBeneficiaires } from '@app/web/beneficiaire/createParticipantsAnonymesForBeneficiaires'
import { banDefaultValueToAdresseBanData } from '@app/web/external-apis/ban/banDefaultValueToAdresseBanData'
import { prismaClient } from '@app/web/prismaClient'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import type { DefaultValues } from 'react-hook-form'
import { getBeneficiaireDefaultCraDataFromExisting } from '../../db/getBeneficiaireDefaultCraDataFromExisting'
import { minutesToCraDureeData } from '../../db/minutesToCraDuree'
import { CraCollectifData } from '../validation/CraCollectifValidation'

export const getCraCollectifDataDefaultValuesFromExisting = async ({
  id,
  mediateurId,
}: {
  id: string
  mediateurId: string
}): Promise<
  | (DefaultValues<CraCollectifData> & {
      id: string
      mediateurId: string
    })
  | null
> => {
  const cra = await prismaClient.activite.findUnique({
    where: {
      id,
      mediateurId,
      suppression: null,
      type: 'Collectif',
    },
    select: {
      accompagnements: {
        select: {
          beneficiaire: true,
          premierAccompagnement: true,
        },
      },
      date: true,
      duree: true,
      titreAtelier: true,
      typeLieu: true,
      lieuCodeInsee: true,
      lieuCodePostal: true,
      lieuCommune: true,
      structureId: true,
      materiel: true,
      thematiques: true,
      niveau: true,
      notes: true,
      precisionsDemarche: true,
      rdvServicePublicId: true,
    },
  })

  if (!cra) {
    return null
  }

  const {
    date,
    duree,
    notes,
    thematiques,
    materiel,
    precisionsDemarche,
    lieuCommune,
    lieuCodePostal,
    lieuCodeInsee,
    structureId,
    accompagnements,
    typeLieu,
    niveau,
    titreAtelier,
    rdvServicePublicId,
  } = cra

  const { beneficiairesSuivis, participantsAnonymes } =
    createParticipantsAnonymesForBeneficiaires(
      accompagnements.map(({ beneficiaire, premierAccompagnement }) => ({
        ...beneficiaire,
        premierAccompagnement,
      })),
    )

  const participantsDefaultValues = beneficiairesSuivis.map(
    (beneficiaire) => getBeneficiaireDefaultCraDataFromExisting(beneficiaire)(),
    // I cannot figure out how to make the type checker happy without this cast
  ) as Exclude<
    DefaultValues<CraCollectifData>['participants'],
    undefined
  > satisfies DefaultValues<CraCollectifData>['participants']

  const defaultValues = {
    id,
    mediateurId,
    participants: participantsDefaultValues,
    date: dateAsIsoDay(date),
    duree: minutesToCraDureeData(duree) ?? {},
    notes: notes ?? undefined,
    materiel: materiel ?? undefined,
    thematiques: thematiques ?? undefined,
    precisionsDemarche: precisionsDemarche ?? undefined,
    structureId: structureId ?? undefined,
    lieuCommuneData:
      lieuCommune && lieuCodePostal && lieuCodeInsee
        ? banDefaultValueToAdresseBanData({
            commune: lieuCommune ?? undefined,
            codePostal: lieuCodePostal ?? undefined,
            codeInsee: lieuCodeInsee ?? undefined,
          })
        : undefined,
    participantsAnonymes,
    typeLieu: typeLieu ?? undefined,
    niveau: niveau ?? undefined,
    titreAtelier: titreAtelier ?? undefined,
    rdvServicePublicId: rdvServicePublicId ?? undefined,
  } satisfies DefaultValues<CraCollectifData>

  return defaultValues
}
