import { v4 } from 'uuid'
import z from 'zod'
import * as Sentry from '@sentry/nextjs'
import { prismaClient } from '@app/web/prismaClient'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { RenseignerStructureEmployeuseValidation } from '@app/web/inscription/RenseignerStructureEmployeuse'
import { SessionUser } from '@app/web/auth/sessionUser'
import { forbiddenError } from '@app/web/server/rpc/trpcErrors'
import { StructureEmployeuseLieuActiviteValidation } from '@app/web/inscription/StructureEmployeuseLieuActivite'
import { LieuxActiviteValidation } from '@app/web/inscription/LieuxActivite'
import { searchAdresse } from '@app/web/external-apis/apiAdresse'
import { StructureCreationDataWithSiret } from '@app/web/app/structure/StructureValidation'
import { isDefinedAndNotNull } from '@app/web/utils/isDefinedAndNotNull'
import { cartoStructureToStructure } from '@app/web/structure/cartoStructureToStructure'

const inscriptionGuard = (
  targetUserId: string,
  grantee: Pick<SessionUser, 'role' | 'id'>,
) => {
  if (grantee.role !== 'Admin' && grantee.id !== targetUserId) {
    throw forbiddenError()
  }
}

const getOrCreateStructureEmployeuse = async (
  structureEmployeuse: StructureCreationDataWithSiret,
) => {
  const existingStructure = await prismaClient.structure.findFirst({
    where: {
      id: structureEmployeuse.id ?? undefined,
      siret: structureEmployeuse.siret,
      suppression: null,
    },
    select: {
      id: true,
    },
  })

  if (existingStructure) {
    return existingStructure
  }

  const adresseResult = await searchAdresse(structureEmployeuse.adresse)

  if (!adresseResult) {
    // We create with default data if no adresse found but raise a Sentry exception
    Sentry.captureException(new Error('No adresse info found on api adresse'), {
      data: {
        structureEmployeuse,
      },
    })

    return prismaClient.structure.create({
      data: {
        id: v4(),
        siret: structureEmployeuse.siret,
        codeInsee: structureEmployeuse.codeInsee,
        nom: structureEmployeuse.nom,
        adresse: structureEmployeuse.adresse,
        commune: structureEmployeuse.commune,
        codePostal: '',
      },
      select: {
        id: true,
      },
    })
  }

  return prismaClient.structure.create({
    data: {
      id: v4(),
      siret: structureEmployeuse.siret,
      codeInsee: structureEmployeuse.codeInsee,
      nom: structureEmployeuse.nom,
      adresse:
        `${adresseResult.properties.housenumber} ${adresseResult.properties.street}`.trim(),
      commune: adresseResult.properties.city,
      codePostal: adresseResult.properties.postcode,
      longitude: adresseResult.geometry.coordinates[0],
      latitude: adresseResult.geometry.coordinates[1],
    },
  })
}

export const inscriptionRouter = router({
  renseignerStructureEmployeuse: protectedProcedure
    .input(RenseignerStructureEmployeuseValidation)
    .mutation(
      async ({
        input: { profil, structureEmployeuse, userId, conseillerNumeriqueId },
        ctx: { user: sessionUser },
      }) => {
        inscriptionGuard(userId, sessionUser)

        const structure =
          await getOrCreateStructureEmployeuse(structureEmployeuse)

        const transactionResult = await prismaClient.$transaction(
          async (transaction) => {
            // Remove link between user and structureEmployeuse if it already exists
            await transaction.employeStructure.updateMany({
              where: {
                userId,
                structure: {
                  id: { not: structure.id },
                },
                suppression: null,
              },
              data: {
                suppression: new Date(),
              },
            })

            const updatedUser = await transaction.user.update({
              where: {
                id: userId,
              },
              data: {
                structureEmployeuseRenseignee: new Date(),
                profilInscription: profil,
                emplois: {
                  create: {
                    id: v4(),
                    structureId: structure.id,
                  },
                },
                mediateur: sessionUser.mediateur
                  ? undefined
                  : {
                      create: {
                        id: v4(),
                        // TODO this should be checked and add conum infos through api ?
                        conseillerNumerique: conseillerNumeriqueId
                          ? {
                              connectOrCreate: {
                                create: {
                                  id: conseillerNumeriqueId,
                                },
                                where: {
                                  id: conseillerNumeriqueId,
                                },
                              },
                            }
                          : undefined,
                      },
                    },
              },
              select: {
                id: true,
                structureEmployeuseRenseignee: true,
                emplois: true,
              },
            })

            return updatedUser
          },
        )

        return transactionResult
      },
    ),
  ajouterStructureEmployeuseEnLieuActivite: protectedProcedure
    .input(StructureEmployeuseLieuActiviteValidation)
    .mutation(
      async ({
        input: { userId, estLieuActivite, structureEmployeuseId },
        ctx: { user: sessionUser },
      }) => {
        inscriptionGuard(userId, sessionUser)

        if (estLieuActivite) {
          // Add a lieu d'activité for the structure if not exists
          const existing = await prismaClient.mediateurEnActivite.findFirst({
            where: {
              mediateur: {
                userId,
              },
              structureId: structureEmployeuseId,
              suppression: null,
            },
            select: {
              id: true,
            },
          })

          if (existing) {
            return existing
          }

          return prismaClient.mediateurEnActivite.create({
            data: {
              id: v4(),
              mediateur: {
                connect: {
                  userId,
                },
              },
              structure: {
                connect: {
                  id: structureEmployeuseId,
                },
              },
            },
            select: {
              id: true,
            },
          })
        }

        // Remove the link between the user and the structure if it exists
        await prismaClient.mediateurEnActivite.updateMany({
          where: {
            mediateur: {
              userId,
            },
            structureId: structureEmployeuseId,
            suppression: null,
          },
          data: {
            suppression: new Date(),
          },
        })

        return null
      },
    ),
  renseignerLieuxActivite: protectedProcedure
    .input(LieuxActiviteValidation)
    .mutation(
      async ({
        input: { userId, lieuxActivite },
        ctx: { user: sessionUser },
      }) => {
        inscriptionGuard(userId, sessionUser)

        const existingActivite =
          await prismaClient.mediateurEnActivite.findMany({
            where: {
              mediateur: {
                userId,
              },
              suppression: null,
            },
            select: {
              id: true,
              structure: {
                select: {
                  id: true,
                  structureCartographieNationaleId: true,
                },
              },
            },
          })

        const lieuxActiviteCartoIds = new Set<string>(
          lieuxActivite
            .map(
              ({ structureCartographieNationaleId }) =>
                structureCartographieNationaleId,
            )
            .filter(isDefinedAndNotNull),
        )

        const lieuxActiviteIds = new Set<string>(
          lieuxActivite.map(({ id }) => id).filter(isDefinedAndNotNull),
        )

        // Delete all existing activite that are not in the new list of carto ids
        // AND that is not in the new list of internal ids
        // For now if removed and readed, it will be deleted here and recreated after
        const toDelete = existingActivite.filter(
          ({ structure: existing }) =>
            // e.g. if the structure was removed, re-added and has the same carto id
            (existing.structureCartographieNationaleId &&
              !lieuxActiviteCartoIds.has(
                existing.structureCartographieNationaleId,
              )) ||
            // If the structure already has an internal id and did not come from carto nationale
            (!existing.structureCartographieNationaleId &&
              !lieuxActiviteIds.has(existing.id)),
        )

        const existingStructuresForCartoIds =
          await prismaClient.structure.findMany({
            where: {
              structureCartographieNationaleId: {
                in: [...lieuxActiviteCartoIds.values()],
              },
            },
          })

        const existingStructuresByCartoId = new Map(
          existingStructuresForCartoIds.map((s) => [
            s.structureCartographieNationaleId as string,
            s,
          ]),
        )

        const structuresToCreate = lieuxActivite.filter(
          ({ structureCartographieNationaleId }) =>
            !!structureCartographieNationaleId &&
            !existingStructuresByCartoId.has(structureCartographieNationaleId),
        )

        const result = await prismaClient.$transaction(async (transaction) => {
          const deleted = await transaction.mediateurEnActivite.updateMany({
            where: {
              id: { in: toDelete.map(({ id }) => id) },
            },
            data: {
              suppression: new Date(),
            },
          })

          const newActivites = await Promise.all(
            structuresToCreate.map(async (lieu) => {
              if (!lieu.structureCartographieNationaleId) {
                // This is not an exisint carto structure, we just create the lieu

                if (!lieu.id) {
                  throw new Error('Invalid structure for lieu activité')
                }

                return transaction.mediateurEnActivite.create({
                  data: {
                    id: v4(),
                    mediateur: {
                      connect: {
                        userId,
                      },
                    },
                    structure: {
                      connect: {
                        id: lieu.id,
                      },
                    },
                  },
                })
              }

              const structure = existingStructuresByCartoId.get(
                lieu.structureCartographieNationaleId,
              )

              if (structure) {
                // Structure already exists, we just create the lieu, linking with carto id
                return transaction.mediateurEnActivite.create({
                  data: {
                    id: v4(),
                    mediateur: {
                      connect: {
                        userId,
                      },
                    },
                    structure: {
                      connect: {
                        structureCartographieNationaleId:
                          lieu.structureCartographieNationaleId,
                      },
                    },
                  },
                })
              }

              // Structure does not exist, we create it with the lieu
              const cartoStructure =
                await transaction.structureCartographieNationale.findFirst({
                  where: {
                    id: lieu.structureCartographieNationaleId,
                  },
                })

              if (!cartoStructure) {
                throw new Error('Structure carto not found')
              }

              return transaction.mediateurEnActivite.create({
                data: {
                  id: v4(),
                  mediateur: {
                    connect: {
                      userId,
                    },
                  },
                  structure: {
                    create: cartoStructureToStructure(cartoStructure),
                  },
                },
              })
            }),
          )

          return { deleted, newActivites }
        })

        return result
      },
    ),
  validerInscription: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ input: { userId }, ctx: { user: sessionUser } }) => {
      inscriptionGuard(userId, sessionUser)

      await prismaClient.user.update({
        where: {
          id: userId,
        },
        data: {
          inscriptionValidee: new Date(),
        },
      })
    }),
})