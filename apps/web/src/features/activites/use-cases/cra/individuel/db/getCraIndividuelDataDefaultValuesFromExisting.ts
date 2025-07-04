import { banDefaultValueToAdresseBanData } from '@app/web/external-apis/ban/banDefaultValueToAdresseBanData'
import { prismaClient } from '@app/web/prismaClient'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import { optionalBooleanToYesNo } from '@app/web/utils/yesNoBooleanOptions'
import { DefaultValues } from 'react-hook-form'
import { getBeneficiaireDefaultCraDataFromExisting } from '../../db/getBeneficiaireDefaultCraDataFromExisting'
import { minutesToCraDureeData } from '../../db/minutesToCraDuree'
import { CraIndividuelData } from '../validation/CraIndividuelValidation'

export const getCraIndividuelDataDefaultValuesFromExisting = async ({
  id,
  mediateurId,
}: {
  id: string
  mediateurId: string
}): Promise<
  | (DefaultValues<CraIndividuelData> & {
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
      type: 'Individuel',
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
      typeLieu: true,
      lieuCodeInsee: true,
      lieuCodePostal: true,
      lieuCommune: true,
      structure: {
        select: {
          id: true,
          nom: true,
          adresse: true,
          codePostal: true,
          commune: true,
        },
      },
      materiel: true,
      thematiques: true,
      autonomie: true,
      orienteVersStructure: true,
      structureDeRedirection: true,
      notes: true,
      precisionsDemarche: true,
      rdvServicePublicId: true,
    },
  })

  if (!cra) {
    return null
  }

  const {
    accompagnements,
    date,
    duree,
    notes,
    autonomie,
    thematiques,
    structureDeRedirection,
    precisionsDemarche,
    typeLieu,
    lieuCodeInsee,
    lieuCodePostal,
    lieuCommune,
    structure,
    materiel,
    orienteVersStructure,
    rdvServicePublicId,
  } = cra

  const beneficiaire = accompagnements[0]?.beneficiaire

  return {
    id,
    mediateurId,
    beneficiaire:
      beneficiaire != null
        ? getBeneficiaireDefaultCraDataFromExisting(beneficiaire)(
            accompagnements[0].premierAccompagnement,
          )
        : {},
    date: dateAsIsoDay(date),
    duree: minutesToCraDureeData(duree) ?? {},
    notes: notes ?? undefined,
    autonomie: autonomie ?? undefined,
    orienteVersStructure: optionalBooleanToYesNo(orienteVersStructure),
    materiel: materiel ?? undefined,
    thematiques: thematiques ?? undefined,
    structureDeRedirection: structureDeRedirection ?? undefined,
    precisionsDemarche: precisionsDemarche ?? undefined,
    structure: structure
      ? {
          id: structure.id,
          nom: structure.nom ?? undefined,
          adresse:
            structure.adresse && structure.codePostal && structure.commune
              ? `${structure.adresse}, ${structure.codePostal} ${structure.commune}`
              : undefined,
        }
      : undefined,
    lieuCommuneData:
      lieuCommune && lieuCodePostal && lieuCodeInsee
        ? banDefaultValueToAdresseBanData({
            commune: lieuCommune ?? undefined,
            codePostal: lieuCodePostal ?? undefined,
            codeInsee: lieuCodeInsee ?? undefined,
          })
        : undefined,
    typeLieu: typeLieu ?? undefined,
    rdvServicePublicId: rdvServicePublicId ?? undefined,
  } satisfies DefaultValues<CraIndividuelData>
}
