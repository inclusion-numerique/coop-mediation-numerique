import { searchStructureEmployeuseCombined } from '@app/web/features/inscription/use-cases/renseigner-structure-employeuse/searchStructureEmployeuseCombined'
import { CreerStructureValidation } from '@app/web/features/structures/CreerStructureValidation'
import { searchStructuresEmployeuses } from '@app/web/features/structures/getStructuresEmployeusesOptions'
import { mediateurCoordonnesIdsFor } from '@app/web/mediateurs/mediateurCoordonnesIdsFor'
import { mergeStructure } from '@app/web/features/structures/use-cases/merge/mutations/mergeStructure'
import { prismaClient } from '@app/web/prismaClient'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { enforceIsAdmin } from '@app/web/server/rpc/enforceIsAdmin'
import { searchLieuActiviteCombined } from '@app/web/structure/searchLieuActiviteCombined'
import { searchStructure } from '@app/web/structure/searchStructure'
import { searchStructureCartographieNationale } from '@app/web/structure/searchStructureCartographieNationale'
import { fixTelephone } from '@app/web/utils/clean-operations'
import { onlyDefinedAndNotNull } from '@app/web/utils/onlyDefinedAndNotNull'
import { createStopwatch } from '@app/web/utils/stopwatch'
import { Itinerance, ModaliteAcces } from '@prisma/client'
import { v4 } from 'uuid'
import { z } from 'zod'

export const structuresRouter = router({
  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(({ input: { query } }) => searchStructure(query)),

  searchCombined: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(({ input: { query } }) => searchStructureEmployeuseCombined(query)),

  searchCartographieNationale: protectedProcedure
    .input(
      z.object({ query: z.string(), except: z.array(z.string()).nullish() }),
    )
    .query(({ input: { query, except } }) =>
      searchStructureCartographieNationale(query, {
        except: except ?? undefined,
      }),
    ),

  searchLieuActiviteCombined: protectedProcedure
    .input(
      z.object({ query: z.string(), except: z.array(z.string()).nullish() }),
    )
    .query(({ input: { query, except } }) =>
      searchLieuActiviteCombined(query, {
        except: except ?? undefined,
      }),
    ),

  searchStructuresEmployeuses: protectedProcedure
    .input(
      z.object({
        query: z.string(),
        excludeIds: z.array(z.string().uuid()).optional(),
      }),
    )
    .query(({ input: { query, excludeIds }, ctx: { user } }) => {
      const mediateurIds = [
        ...(user.mediateur?.id ? [user.mediateur.id] : []),
        ...mediateurCoordonnesIdsFor(user),
      ]
      return searchStructuresEmployeuses({ query, mediateurIds, excludeIds })
    }),

  create: protectedProcedure.input(CreerStructureValidation).mutation(
    async ({
      input: {
        lieuActiviteMediateurId,
        nom,
        typologies,
        adresseBan: {
          longitude,
          latitude,
          codeInsee,
          nom: adresse,
          commune,
          codePostal,
        },
        complementAdresse,
        siret,
        rna,
        visiblePourCartographieNationale,
        presentationResume,
        presentationDetail,
        siteWeb,
        ficheAccesLibre,
        horaires,
        priseEnChargeSpecifique,
        modalitesAcces,
        fraisACharge,
        lieuItinerant,
        publicsSpecifiquementAdresses,
        services,
        modalitesAccompagnement,
        priseRdv,
      },
      ctx: { user },
    }) => {
      const stopwatch = createStopwatch()

      const id = v4()

      const created = await prismaClient.structure.create({
        data: {
          id,
          nom,
          typologies: typologies ?? undefined,
          adresse,
          commune,
          codePostal,
          complementAdresse,
          siret,
          rna,
          longitude,
          latitude,
          codeInsee,
          visiblePourCartographieNationale:
            visiblePourCartographieNationale ?? false,
          presentationResume,
          presentationDetail,
          siteWeb,
          ficheAccesLibre,
          horaires,
          creationParId: user.id,
          mediateursEnActivite: lieuActiviteMediateurId
            ? {
                create: {
                  id: v4(),
                  mediateurId: lieuActiviteMediateurId,
                  debut: new Date(),
                  creationParId: user.id,
                },
              }
            : undefined,
          fraisACharge: fraisACharge ?? undefined,
          itinerance:
            typeof lieuItinerant === 'boolean'
              ? lieuItinerant
                ? [Itinerance.Itinerant]
                : [Itinerance.Fixe]
              : undefined,
          modalitesAcces: modalitesAcces
            ? [
                modalitesAcces.surPlace ? ModaliteAcces.SePresenter : undefined,
                modalitesAcces.parTelephone
                  ? ModaliteAcces.Telephoner
                  : undefined,
                modalitesAcces.parMail
                  ? ModaliteAcces.ContacterParMail
                  : undefined,
              ].filter(onlyDefinedAndNotNull)
            : undefined,
          telephone: modalitesAcces?.numeroTelephone
            ? fixTelephone(modalitesAcces.numeroTelephone)
            : undefined,
          courriels: modalitesAcces?.adresseMail
            ? [modalitesAcces.adresseMail]
            : undefined,
          modalitesAccompagnement: modalitesAccompagnement ?? undefined,
          priseEnChargeSpecifique: priseEnChargeSpecifique ?? undefined,
          publicsSpecifiquementAdresses:
            publicsSpecifiquementAdresses ?? undefined,
          services: services ?? undefined,
          priseRdv: priseRdv ?? undefined,
        },
      })

      await prismaClient.mutation.create({
        data: {
          nom: 'CreerStructure',
          userId: user.id,
          duration: stopwatch.stop().duration,
          data: {
            id,
            nom,
            typologies,
            siret,
            rna,
            codePostal,
          },
        },
      })

      return created
    },
  ),

  merge: protectedProcedure
    .input(
      z.object({
        sourceStructureId: z.string().uuid(),
        targetStructureId: z.string().uuid(),
      }),
    )
    .mutation(async ({ input, ctx: { user } }) => {
      enforceIsAdmin(user)
      return mergeStructure(input.sourceStructureId, input.targetStructureId)
    }),
})
