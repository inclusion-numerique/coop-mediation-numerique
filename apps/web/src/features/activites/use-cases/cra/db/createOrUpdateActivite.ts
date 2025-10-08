import { createBeneficiairesForParticipantsAnonymes } from '@app/web/beneficiaire/createBeneficiairesForParticipantsAnonymes'
import { BeneficiaireCraData } from '@app/web/features/beneficiaires/validation/BeneficiaireValidation'
import { prismaClient } from '@app/web/prismaClient'
import { invalidError } from '@app/web/server/rpc/trpcErrors'
import { getStructureEmployeuseAddressForMediateur } from '@app/web/structure/getStructureEmployeuseAddress'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { fixTelephone } from '@app/web/utils/clean-operations'
import { onlyDefinedAndNotNull } from '@app/web/utils/onlyDefinedAndNotNull'
import { createStopwatch } from '@app/web/utils/stopwatch'
import { yesNoToOptionalBoolean } from '@app/web/utils/yesNoBooleanOptions'
import { Beneficiaire, Prisma, Structure, TypeActivite } from '@prisma/client'
import { v4 } from 'uuid'
import { CraCollectifData } from '../collectif/validation/CraCollectifValidation'
import { CraIndividuelData } from '../individuel/validation/CraIndividuelValidation'
import { getCurrentEmploiForDate } from './getCurrentEmploiForDate'
import { craDureeDataToMinutes } from './minutesToCraDuree'

const getExistingBeneficiairesSuivis = async ({
  beneficiaires,
  mediateurId,
  activiteId,
}: {
  beneficiaires: { id?: string | null }[]
  mediateurId: string
  activiteId?: string | null
}) => {
  if (beneficiaires.length === 0) return []

  const existingBeneficiairesIds = beneficiaires
    .map((beneficiaire) => beneficiaire.id)
    .filter(onlyDefinedAndNotNull)

  const existingBeneficiaires = await prismaClient.beneficiaire.findMany({
    where: {
      id: {
        in: existingBeneficiairesIds,
      },
    },
    select: {
      id: true,
      mediateurId: true,
      anonyme: true,
      accompagnements: {
        select: { id: true, activiteId: true },
      },
    },
  })

  if (existingBeneficiaires.length !== existingBeneficiairesIds.length) {
    throw invalidError('Beneficiaire not found')
  }

  for (const existingBeneficiaire of existingBeneficiaires) {
    if (existingBeneficiaire.mediateurId !== mediateurId) {
      throw invalidError('Beneficiaire not created by current mediateur')
    }
  }

  const beneficiairesWithPremierAccompagnement = existingBeneficiaires.map(
    ({ accompagnements, ...rest }) => ({
      ...rest,
      premierAccompagnement:
        accompagnements.length === 0 ||
        (accompagnements.length === 1 &&
          accompagnements[0].activiteId === activiteId),
    }),
  )

  // Beneficiaire anonyme returned from cra individuel / demarche should not be included
  // as we delete/recreate them from anonymous data given in the form
  return beneficiairesWithPremierAccompagnement.filter(
    ({ anonyme }) => !anonyme,
  )
}

export const getBeneficiairesAnonymesWithOnlyAccompagnementsForThisActivite =
  async ({ activiteId }: { activiteId: string }) => {
    /**
     * We were using prisma :
     * where: {
     *         anonyme: true,
     *         accompagnements: {
     *           every: {
     *             activiteId: id,
     *           },
     *         },
     *       }
     *
     * but this was compiled as a  NOT IN ( ... subquery ) which is way too slow (o(n*m))
     *
     * so we now use a raw query that uses indexes effectively
     */
    const anonymesIds = await prismaClient.$queryRaw<
      { beneficiaire_id: string }[]
    >`
        select a.beneficiaire_id
        from accompagnements a
                 inner join beneficiaires b
                            on b.id = a.beneficiaire_id
                                and b.anonyme = true
        where a.activite_id = ${activiteId}::UUID
          and not exists (select 1
                          from accompagnements a2
                          where a2.beneficiaire_id = a.beneficiaire_id
                            and a2.activite_id <> ${activiteId}::UUID);
    `

    return anonymesIds.map(({ beneficiaire_id }) => beneficiaire_id)
  }

const getExistingStructure = async ({
  structureId,
  mediateurId,
}: {
  structureId: string | null | undefined
  mediateurId: string
}) => {
  if (!structureId) {
    return null
  }
  const existingStructure = await prismaClient.structure.findUnique({
    where: {
      id: structureId,
      mediateursEnActivite: {
        some: {
          mediateurId,
        },
      },
    },
  })

  if (!existingStructure) {
    throw invalidError('Structure not found')
  }

  return existingStructure
}

const beneficiaireAnonymeCreateDataFromForm = ({
  mediateurId,
  prenom,
  nom,
  telephone,
  email,
  anneeNaissance,
  adresse,
  communeResidence,
  genre,
  trancheAge,
  statutSocial,
  notes,
  dejaAccompagne,
}: Partial<BeneficiaireCraData> & {
  mediateurId: string
}): Prisma.BeneficiaireCreateInput & {
  id: string
  dejaAccompagne: boolean
} => ({
  id: v4(),
  mediateur: { connect: { id: mediateurId } },
  prenom: prenom ?? undefined,
  nom: nom ?? undefined,
  anonyme: true,
  telephone: telephone ? fixTelephone(telephone) : undefined,
  email: email ?? undefined,
  anneeNaissance: anneeNaissance ?? undefined,
  adresse: adresse ?? undefined,
  genre: genre ?? undefined,
  trancheAge: trancheAge ?? undefined,
  statutSocial: statutSocial ?? undefined,
  notes: notes ?? undefined,
  commune: communeResidence?.commune ?? undefined,
  communeCodePostal: communeResidence?.codePostal ?? undefined,
  communeCodeInsee: communeResidence?.codeInsee ?? undefined,
  dejaAccompagne: dejaAccompagne ?? false,
})

// Utilisée comme localisation fallback pour les activités à distance
export type StructureEmployeuseCraInfo = Pick<
  Structure,
  'commune' | 'codePostal' | 'codeInsee'
>

export type CreateOrUpdateActiviteInput =
  | {
      type: 'Collectif'
      data: CraCollectifData
    }
  | {
      type: 'Individuel'
      data: CraIndividuelData
    }

const withoutDejaAccompagne = <T>({
  dejaAccompagne: _,
  ...beneficiaireAnonymeToCreate
}: T & { id: string; dejaAccompagne: boolean }) => beneficiaireAnonymeToCreate

// TODO more integration test cases on this critical function
export const createOrUpdateActivite = async ({
  input,
  userId,
  mediateurId,
}: {
  input: CreateOrUpdateActiviteInput
  userId: string
  mediateurId: string
}) => {
  const stopwatch = createStopwatch()

  const { data } = input

  const { date, duree, id, notes, structure, rdvServicePublicId: rdvId } = data

  const creationId = v4()

  const emploi = await getCurrentEmploiForDate({
    mediateurId,
    date: new Date(date),
  })

  const existingActivite = id
    ? await prismaClient.activite.findUnique({
        where: { id },
        select: {
          id: true,
          structureId: true,
          mediateurId: true,
          accompagnements: {
            select: {
              beneficiaireId: true,
            },
          },
        },
      })
    : null

  const existingBeneficiairesSuivis = await getExistingBeneficiairesSuivis({
    mediateurId,
    beneficiaires:
      input.type === TypeActivite.Collectif
        ? input.data.participants
        : input.data.beneficiaire
          ? [input.data.beneficiaire]
          : [],
    activiteId: id,
  })

  const beneficiairesAnonymesCollectif =
    input.type === 'Collectif'
      ? createBeneficiairesForParticipantsAnonymes({
          mediateurId,
          rootUuid: id ?? creationId,
          participantsAnonymes: input.data.participantsAnonymes,
        })
      : []

  // TODO Check this for both update and create
  const beneficiaireAnonymeToCreate =
    input.type === 'Collectif' ||
    // Do not create anonymous beneficiaire for one to one cra if it is "suivi"
    existingBeneficiairesSuivis.length > 0
      ? undefined
      : beneficiaireAnonymeCreateDataFromForm({
          mediateurId,
          ...input.data.beneficiaire,
          prenom: input.data.beneficiaire?.prenom ?? undefined,
          nom: input.data.beneficiaire?.nom ?? undefined,
        })

  const lieuActivite =
    data.typeLieu === 'LieuActivite'
      ? await getExistingStructure({
          structureId: structure?.id,
          mediateurId,
        })
      : null

  // If accompagnement is "A distance", we fetch the structure employeuse to assign location
  const structureEmployeuse =
    data.typeLieu === 'ADistance'
      ? await getStructureEmployeuseAddressForMediateur(mediateurId)
      : null

  const orienteVersStructure = yesNoToOptionalBoolean(
    'orienteVersStructure' in data ? data.orienteVersStructure : undefined,
  )

  const { lieuCommune, lieuCodePostal, lieuCodeInsee } =
    data.typeLieu === 'Domicile' || data.typeLieu === 'Autre'
      ? {
          lieuCommune: data.lieuCommuneData?.commune,
          lieuCodePostal: data.lieuCommuneData?.codePostal,
          lieuCodeInsee: data.lieuCommuneData?.codeInsee,
        }
      : data.typeLieu === 'ADistance'
        ? {
            lieuCommune: structureEmployeuse?.structure.commune ?? null,
            lieuCodePostal: structureEmployeuse?.structure.codePostal ?? null,
            lieuCodeInsee: structureEmployeuse?.structure.codeInsee ?? null,
          }
        : {
            lieuCommune: null,
            lieuCodePostal: null,
            lieuCodeInsee: null,
          }

  // We compute accompagenemnts count view to avoid a second query when querying activites
  const accompagnementsCount =
    existingBeneficiairesSuivis.length +
    beneficiairesAnonymesCollectif.length +
    (beneficiaireAnonymeToCreate ? 1 : 0)

  const activiteData = {
    autonomie: 'autonomie' in data ? data.autonomie : undefined,
    date: new Date(date),
    mediateur: {
      connect: { id: mediateurId },
    },
    accompagnementsCount,
    duree: craDureeDataToMinutes(duree),
    typeLieu: data.typeLieu ?? undefined,
    structureEmployeuse: {
      connect: { id: emploi.structureId },
    },
    niveau: 'niveau' in data ? data.niveau : undefined,
    materiel: 'materiel' in data ? data.materiel : undefined,
    titreAtelier: 'titreAtelier' in data ? data.titreAtelier : undefined,
    precisionsDemarche:
      'precisionsDemarche' in data ? data.precisionsDemarche : undefined,
    lieuCommune,
    lieuCodePostal,
    lieuCodeInsee,
    notes,
    orienteVersStructure,
    rdv: rdvId ? { connect: { id: rdvId } } : undefined,
    structureDeRedirection:
      // For cra individuel, only set structure de redirection if orienteVersStructure is true
      input.type === 'Individuel'
        ? orienteVersStructure
          ? input.data.structureDeRedirection
          : null
        : 'structureDeRedirection' in data
          ? data.structureDeRedirection
          : undefined,
    thematiques: input.data.thematiques,
    structure:
      // Only set structure if it is the correct type of lieuAccompagnement
      lieuActivite
        ? { connect: { id: lieuActivite.id } }
        : id
          ? { disconnect: true } // disconnect if this is an update
          : undefined, // no data if creation
  } satisfies Prisma.ActiviteUpdateInput

  const accompagnementsCreationData = [
    ...existingBeneficiairesSuivis.map((beneficiaire) => ({
      id: v4(),
      beneficiaireId: beneficiaire.id,
      activiteId: existingActivite ? existingActivite.id : creationId,
      premierAccompagnement: beneficiaire.premierAccompagnement,
    })),
    ...beneficiairesAnonymesCollectif.map((beneficiaire) => ({
      id: v4(),
      beneficiaireId: beneficiaire.id,
      activiteId: existingActivite ? existingActivite.id : creationId,
      premierAccompagnement: !beneficiaire.dejaAccompagne,
    })),
    ...(beneficiaireAnonymeToCreate
      ? [
          {
            id: v4(),
            beneficiaireId: beneficiaireAnonymeToCreate.id,
            activiteId: existingActivite ? existingActivite.id : creationId,
            premierAccompagnement: !beneficiaireAnonymeToCreate.dejaAccompagne,
          },
        ]
      : []),
  ] satisfies Prisma.AccompagnementCreateManyInput[]

  // If id is provided, it is an update operation
  if (existingActivite) {
    // We delete all the anonymes beneficiaires that have only this activite as accompagmements to ease the
    // merge logic of old and new anonymous beneficiaires
    const anonymesIdsToDelete =
      await getBeneficiairesAnonymesWithOnlyAccompagnementsForThisActivite({
        activiteId: existingActivite.id,
      })

    // We update all related data
    await prismaClient.$transaction(async (transaction) => {
      // Delete all accompagnements as we recreate them after
      await transaction.accompagnement.deleteMany({
        where: {
          activiteId: existingActivite.id,
        },
      })

      if (anonymesIdsToDelete.length > 0) {
        await transaction.beneficiaire.deleteMany({
          where: {
            anonyme: true,
            id: { in: anonymesIdsToDelete },
          },
        })
      }

      // (re)Create beneficiaire anonyme for one-to-one cra
      if (beneficiaireAnonymeToCreate?.id) {
        await transaction.beneficiaire.create({
          data: withoutDejaAccompagne(beneficiaireAnonymeToCreate),
          select: { id: true },
        })
      }

      if (beneficiairesAnonymesCollectif.length > 0) {
        await transaction.beneficiaire.createMany({
          data: beneficiairesAnonymesCollectif.map((beneficiaire) =>
            withoutDejaAccompagne(beneficiaire),
          ),
        })
      }

      // Create accompagnements
      const createdAccompagnements =
        await transaction.accompagnement.createMany({
          data: accompagnementsCreationData,
        })

      // Delete then create tags
      await transaction.activitesTags.deleteMany({
        where: {
          activiteId: existingActivite.id,
        },
      })

      await transaction.activitesTags.createMany({
        data: input.data.tags.map((tag) => ({
          activiteId: existingActivite.id,
          tagId: tag.id,
        })),
      })

      // Update the activite
      await transaction.activite.update({
        where: { id: existingActivite.id },
        data: {
          ...activiteData,
          modification: new Date(),
        },
      })

      // Update the lieu activite activites count
      // - decrement for the old one
      if (existingActivite.structureId) {
        await transaction.structure.update({
          where: { id: existingActivite.structureId },
          data: { activitesCount: { decrement: 1 } },
        })
      }
      // - increment for the new one
      if (lieuActivite) {
        await transaction.structure.update({
          where: { id: lieuActivite.id },
          data: { activitesCount: { increment: 1 } },
        })
      }
      // Update the mediateur accompagnements count
      // - (the activite count remain the same)
      // - decrement for the old value
      await transaction.mediateur.update({
        where: { id: mediateurId },
        data: {
          accompagnementsCount: {
            decrement: existingActivite.accompagnements.length,
          },
        },
      })
      // - increment for the new value
      await transaction.mediateur.update({
        where: { id: mediateurId },
        data: {
          accompagnementsCount: { increment: createdAccompagnements.count },
        },
      })

      // update the beneficiaires accompagnements count
      // - decrement for the old value
      if (existingActivite.accompagnements.length > 0) {
        await transaction.beneficiaire.updateMany({
          where: {
            id: {
              in: existingActivite.accompagnements.map((a) => a.beneficiaireId),
            },
          },
          data: { accompagnementsCount: { decrement: 1 } },
        })
      }
      // - increment for the new value
      await transaction.beneficiaire.updateMany({
        where: {
          id: { in: accompagnementsCreationData.map((a) => a.beneficiaireId) },
        },
        data: { accompagnementsCount: { increment: 1 } },
      })
    })

    // Create mutation for audit log
    addMutationLog({
      userId,
      nom: 'ModifierActivite',
      duration: stopwatch.stop().duration,
      data: input,
    })

    return {
      id: existingActivite.id,
      type: input.type,
    }
  }

  // Creation transaction
  await prismaClient.$transaction(async (transaction) => {
    // Create beneficiaire anonyme for one to one cras
    if (beneficiaireAnonymeToCreate) {
      await transaction.beneficiaire.create({
        data: withoutDejaAccompagne(beneficiaireAnonymeToCreate),
        select: { id: true },
      })
    }
    // Create beneficiaires anonymes
    if (beneficiairesAnonymesCollectif.length > 0) {
      await transaction.beneficiaire.createMany({
        data: beneficiairesAnonymesCollectif.map((beneficiaire) =>
          withoutDejaAccompagne(beneficiaire),
        ),
      })
    }

    // Create activite
    await transaction.activite.create({
      data: {
        ...activiteData,
        type: input.type,
        id: creationId,
      },
      select: { id: true },
    })

    // Create tags for the activite
    await transaction.activitesTags.createMany({
      data: input.data.tags.map((tag) => ({
        activiteId: creationId,
        tagId: tag.id,
      })),
    })

    // Create accompagnements
    const createdAccompagnements = await transaction.accompagnement.createMany({
      data: accompagnementsCreationData,
    })

    // Update the mediateur accompagnements count
    await transaction.mediateur.update({
      where: { id: mediateurId },
      data: {
        activitesCount: { increment: 1 },
        accompagnementsCount: { increment: createdAccompagnements.count },
      },
    })

    // Update the beneficiaires accompagnements count
    await transaction.beneficiaire.updateMany({
      where: {
        id: { in: accompagnementsCreationData.map((a) => a.beneficiaireId) },
      },
      data: { accompagnementsCount: { increment: 1 } },
    })

    // Update the structure activites count
    if (lieuActivite) {
      await transaction.structure.update({
        where: { id: lieuActivite.id },
        data: { activitesCount: { increment: 1 } },
      })
    }
  })

  // Create mutation for audit log
  addMutationLog({
    userId,
    nom: 'CreerActivite',
    duration: stopwatch.stop().duration,
    data: input,
  })

  return {
    id: creationId,
    type: input.type,
  }
}
