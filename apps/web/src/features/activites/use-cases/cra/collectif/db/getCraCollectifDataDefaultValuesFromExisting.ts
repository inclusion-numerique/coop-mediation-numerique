import { banDefaultValueToAdresseBanData } from '@app/web/external-apis/ban/banDefaultValueToAdresseBanData'
import { createParticipantsAnonymesForBeneficiaires } from '@app/web/features/activites/use-cases/cra/collectif/createParticipantsAnonymesForBeneficiaires'
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
      lieuInclusion: {
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
      niveau: true,
      notes: true,
      precisionsDemarche: true,
      rdvServicePublicId: true,
      tags: {
        select: {
          tag: {
            select: {
              id: true,
              nom: true,
            },
          },
        },
      },
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
    lieuCodeInsee,
    lieuCodePostal,
    lieuCommune,
    lieuInclusion,
    accompagnements,
    typeLieu,
    niveau,
    titreAtelier,
    rdvServicePublicId,
    tags,
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

  return {
    id,
    mediateurId,
    participants: participantsDefaultValues,
    date: dateAsIsoDay(date),
    duree: minutesToCraDureeData(duree) ?? {},
    notes: notes ?? undefined,
    materiel: materiel ?? undefined,
    thematiques: thematiques ?? undefined,
    precisionsDemarche: precisionsDemarche ?? undefined,
    structure: lieuInclusion
      ? {
          id: lieuInclusion.id,
          nom: lieuInclusion.nom ?? undefined,
          adresse:
            lieuInclusion.adresse &&
            lieuInclusion.codePostal &&
            lieuInclusion.commune
              ? `${lieuInclusion.adresse}, ${lieuInclusion.codePostal} ${lieuInclusion.commune}`
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
    participantsAnonymes,
    typeLieu: typeLieu ?? undefined,
    niveau: niveau ?? undefined,
    titreAtelier: titreAtelier ?? undefined,
    rdvServicePublicId: rdvServicePublicId ?? undefined,
    tags: tags.map(({ tag }) => tag) ?? [],
  } satisfies DefaultValues<CraCollectifData>
}
