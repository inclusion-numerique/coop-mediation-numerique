import { rechercherUnLieuActivite } from '@app/web/features/lieux-activite/abilities/rechercher-un-lieu-activite'
import { MediateurId } from '@app/web/features/lieux-activite/domain/mediateur-id'
import { CreerLieuActiviteValidation } from '@app/web/features/structures/CreerLieuActiviteValidation'
import {
  setDescriptionFields,
  setInformationsGeneralesFields,
  setInformationsPratiquesFields,
  setModalitesAccesAuServiceFields,
  setServicesEtAccompagnementFields,
  setTypesDePublicsAccueillisFields,
  setVisiblePourCartographieNationaleFields,
} from '@app/web/features/structures/lieuInclusionDepuisSaisie'
import { prismaClient } from '@app/web/prismaClient'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { enforceIsMediateur } from '@app/web/server/rpc/enforceIsMediateur'
import { forbiddenError, invalidError } from '@app/web/server/rpc/trpcErrors'
import { v4 } from 'uuid'
import z from 'zod'

export const lieuActiviteRouter = router({
  create: protectedProcedure
    .input(CreerLieuActiviteValidation)
    .mutation(async ({ input, ctx: { user } }) => {
      if (!user.mediateur) {
        throw forbiddenError("Cet utilisateur n'est pas un médiateur")
      }

      return prismaClient.lieuInclusion.create({
        data: {
          id: v4(),
          ...setInformationsGeneralesFields(input),
          ...setVisiblePourCartographieNationaleFields(input),
          ...setInformationsPratiquesFields(input),
          ...setDescriptionFields(input),
          ...setServicesEtAccompagnementFields(input),
          ...setModalitesAccesAuServiceFields(input),
          ...setTypesDePublicsAccueillisFields(input),
          creationParId: user.id,
          mediateursEnActivite: {
            create: {
              id: v4(),
              mediateurId: user.mediateur.id,
              debut: new Date(),
              creationParId: user.id,
            },
          },
        },
      })
    }),
  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(({ input: { query }, ctx: { user: sessionUser } }) => {
      enforceIsMediateur(sessionUser)

      return rechercherUnLieuActivite({
        mediateurId: MediateurId(sessionUser.mediateur.id),
        recherche: query,
      })
    }),
})
