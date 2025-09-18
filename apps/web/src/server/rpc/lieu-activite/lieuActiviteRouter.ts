import { CreerLieuActiviteValidation } from '@app/web/features/lieux-activite/CreerLieuActiviteValidation'
import { searchLieuxActivite } from '@app/web/features/lieux-activite/searchLieuxActivite'
import {
  DescriptionData,
  DescriptionValidation,
} from '@app/web/features/structures/DescriptionValidation'
import {
  InformationsGeneralesData,
  InformationsGeneralesValidation,
} from '@app/web/features/structures/InformationsGeneralesValidation'
import {
  InformationsPratiquesData,
  InformationsPratiquesValidation,
} from '@app/web/features/structures/InformationsPratiquesValidation'
import {
  ModalitesAccesAuServiceData,
  ModalitesAccesAuServiceValidation,
} from '@app/web/features/structures/ModalitesAccesAuServiceValidation'
import {
  ServicesEtAccompagnementData,
  ServicesEtAccompagnementValidation,
} from '@app/web/features/structures/ServicesEtAccompagnementValidation'
import {
  TypesDePublicsAccueillisData,
  TypesDePublicsAccueillisValidation,
} from '@app/web/features/structures/TypesDePublicsAccueillisValidation'
import {
  VisiblePourCartographieNationaleData,
  VisiblePourCartographieNationaleValidation,
} from '@app/web/features/structures/VisiblePourCartographieNationaleValidation'
import { prismaClient } from '@app/web/prismaClient'
import { protectedProcedure, router } from '@app/web/server/rpc/createRouter'
import { enforceIsMediateur } from '@app/web/server/rpc/enforceIsMediateur'
import { forbiddenError, invalidError } from '@app/web/server/rpc/trpcErrors'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { fixTelephone } from '@app/web/utils/clean-operations'
import { onlyDefinedAndNotNull } from '@app/web/utils/onlyDefinedAndNotNull'
import { createStopwatch } from '@app/web/utils/stopwatch'
import { Itinerance, ModaliteAcces } from '@prisma/client'
import { v4 } from 'uuid'
import z from 'zod'
import { lieuActiviteValidation } from './lieuActiviteValidation'

const lieuActiviteToUpdate = async (input: { id: string }) => {
  const structure = await prismaClient.structure.findFirst({
    where: {
      id: input.id,
    },
  })

  return structure ?? null
}

const setInformationsGeneralesFields = ({
  nom,
  adresseBan,
  complementAdresse,
  siret,
  rna,
  typologies,
}: Omit<InformationsGeneralesData, 'id'>) => ({
  nom,
  adresse: adresseBan.nom,
  commune: adresseBan.commune,
  codePostal: adresseBan.codePostal,
  codeInsee: adresseBan.codeInsee,
  latitude: adresseBan.latitude,
  longitude: adresseBan.longitude,
  complementAdresse,
  siret,
  rna,
  typologies,
})

const setVisiblePourCartographieNationaleFields = ({
  visiblePourCartographieNationale,
}: Omit<VisiblePourCartographieNationaleData, 'id'>) => ({
  visiblePourCartographieNationale,
})

const setInformationsPratiquesFields = ({
  lieuItinerant,
  siteWeb,
  ficheAccesLibre,
  horaires,
  priseRdv,
}: Omit<InformationsPratiquesData, 'id'>) => ({
  itinerance:
    lieuItinerant == null
      ? undefined
      : lieuItinerant
        ? [Itinerance.Itinerant]
        : [Itinerance.Fixe],
  siteWeb: siteWeb ?? undefined,
  ficheAccesLibre: ficheAccesLibre ?? undefined,
  horaires: horaires ?? undefined,
  priseRdv: priseRdv ?? undefined,
})

const setDescriptionFields = ({
  presentationResume,
  presentationDetail,
  formationsLabels,
}: Omit<DescriptionData, 'id'>) => ({
  presentationResume: presentationResume ?? undefined,
  presentationDetail: presentationDetail ?? undefined,
  formationsLabels: formationsLabels ?? undefined,
})

const setServicesEtAccompagnementFields = ({
  services,
  modalitesAccompagnement,
}: Omit<ServicesEtAccompagnementData, 'id'>) => ({
  services: services ?? undefined,
  modalitesAccompagnement: modalitesAccompagnement ?? undefined,
})

const setModalitesAccesAuServiceFields = ({
  modalitesAcces,
  fraisACharge,
}: Omit<ModalitesAccesAuServiceData, 'id'>) => ({
  telephone:
    modalitesAcces?.parTelephone && modalitesAcces?.numeroTelephone != null
      ? fixTelephone(modalitesAcces.numeroTelephone)
      : null,
  courriels:
    modalitesAcces?.parMail && modalitesAcces?.adresseMail != null
      ? [modalitesAcces.adresseMail]
      : [],
  modalitesAcces: modalitesAcces
    ? [
        modalitesAcces.surPlace ? ModaliteAcces.SePresenter : undefined,
        modalitesAcces.parTelephone ? ModaliteAcces.Telephoner : undefined,
        modalitesAcces.parMail ? ModaliteAcces.ContacterParMail : undefined,
      ].filter(onlyDefinedAndNotNull)
    : undefined,
  fraisACharge: fraisACharge ?? undefined,
})

const setTypesDePublicsAccueillisFields = ({
  priseEnChargeSpecifique,
  publicsSpecifiquementAdresses,
}: Omit<TypesDePublicsAccueillisData, 'id'>) => ({
  priseEnChargeSpecifique: priseEnChargeSpecifique ?? undefined,
  publicsSpecifiquementAdresses: publicsSpecifiquementAdresses ?? undefined,
})

export const lieuActiviteRouter = router({
  create: protectedProcedure
    .input(CreerLieuActiviteValidation)
    .mutation(async ({ input, ctx: { user } }) => {
      if (!user.mediateur) {
        throw forbiddenError("Cet utilisateur n'est pas un médiateur")
      }

      return prismaClient.structure.create({
        data: {
          id: v4(),
          ...setInformationsGeneralesFields(input),
          ...setVisiblePourCartographieNationaleFields(input),
          ...setInformationsPratiquesFields(input),
          ...setDescriptionFields(input),
          ...setServicesEtAccompagnementFields(input),
          ...setModalitesAccesAuServiceFields(input),
          ...setTypesDePublicsAccueillisFields(input),
          mediateursEnActivite: {
            create: {
              id: v4(),
              mediateurId: user.mediateur.id,
            },
          },
        },
      })
    }),
  delete: protectedProcedure
    .input(
      z.object({
        mediateurEnActiviteId: lieuActiviteValidation,
      }),
    )
    .mutation(async ({ input: { mediateurEnActiviteId }, ctx: { user } }) => {
      if (!user.mediateur) {
        throw forbiddenError("Cet utilisateur n'est pas un médiateur")
      }

      const stopwatch = createStopwatch()

      const lieuActivite = await prismaClient.mediateurEnActivite.findUnique({
        where: {
          id: mediateurEnActiviteId,
          mediateurId: user.mediateur.id,
          suppression: null,
        },
      })

      if (!lieuActivite) {
        throw invalidError("Ce lieu d’activité n'existe pas pour ce médiateur")
      }

      const timestamp = new Date()
      await prismaClient.mediateurEnActivite.updateMany({
        where: {
          id: mediateurEnActiviteId,
        },
        data: {
          suppression: timestamp,
          modification: timestamp,
        },
      })

      addMutationLog({
        userId: user.id,
        nom: 'SupprimerMediateurEnActivite',
        duration: stopwatch.stop().duration,
        data: {
          mediateurEnActiviteId,
        },
      })
    }),
  updateInformationsGenerales: protectedProcedure
    .input(InformationsGeneralesValidation)
    .mutation(async ({ input, ctx: { user } }) => {
      const stopwatch = createStopwatch()
      const structure = await lieuActiviteToUpdate(input)

      if (structure == null) return

      const updated = await prismaClient.structure.update({
        where: { id: structure.id },
        data: {
          ...structure,
          ...setInformationsGeneralesFields(input),
          modification: new Date(),
        },
      })

      addMutationLog({
        userId: user.id,
        nom: 'ModifierStructure',
        duration: stopwatch.stop().duration,
        data: input,
      })

      return updated
    }),
  updateVisiblePourCartographieNationale: protectedProcedure
    .input(VisiblePourCartographieNationaleValidation)
    .mutation(async ({ input, ctx: { user } }) => {
      const stopwatch = createStopwatch()
      const structure = await lieuActiviteToUpdate(input)

      if (structure == null) return

      const updated = await prismaClient.structure.update({
        where: { id: structure.id },
        data: {
          ...structure,
          ...setVisiblePourCartographieNationaleFields(input),
          modification: new Date(),
        },
      })

      addMutationLog({
        userId: user.id,
        nom: 'ModifierStructure',
        duration: stopwatch.stop().duration,
        data: input,
      })

      return updated
    }),
  updateInformationsPratiques: protectedProcedure
    .input(InformationsPratiquesValidation)
    .mutation(async ({ input, ctx: { user } }) => {
      const stopwatch = createStopwatch()
      const structure = await lieuActiviteToUpdate(input)

      if (structure == null) return

      const updated = await prismaClient.structure.update({
        where: { id: structure.id },
        data: {
          ...structure,
          ...setInformationsPratiquesFields(input),
          modification: new Date(),
        },
      })

      addMutationLog({
        userId: user.id,
        nom: 'ModifierStructure',
        duration: stopwatch.stop().duration,
        data: input,
      })

      return updated
    }),
  updateDescription: protectedProcedure
    .input(DescriptionValidation)
    .mutation(async ({ input, ctx: { user } }) => {
      const stopwatch = createStopwatch()
      const structure = await lieuActiviteToUpdate(input)

      if (structure == null) return

      const updated = await prismaClient.structure.update({
        where: { id: structure.id },
        data: {
          ...structure,
          ...setDescriptionFields(input),
          modification: new Date(),
        },
      })

      addMutationLog({
        userId: user.id,
        nom: 'ModifierStructure',
        duration: stopwatch.stop().duration,
        data: input,
      })

      return updated
    }),
  updateServicesEtAccompagnement: protectedProcedure
    .input(ServicesEtAccompagnementValidation)
    .mutation(async ({ input, ctx: { user } }) => {
      const stopwatch = createStopwatch()
      const structure = await lieuActiviteToUpdate(input)

      if (structure == null) return

      const updated = await prismaClient.structure.update({
        where: { id: structure.id },
        data: {
          ...structure,
          ...setServicesEtAccompagnementFields(input),
          modification: new Date(),
        },
      })

      addMutationLog({
        userId: user.id,
        nom: 'ModifierStructure',
        duration: stopwatch.stop().duration,
        data: input,
      })

      return updated
    }),
  updateModalitesAccesAuService: protectedProcedure
    .input(ModalitesAccesAuServiceValidation)
    .mutation(async ({ input, ctx: { user } }) => {
      const stopwatch = createStopwatch()
      const structure = await lieuActiviteToUpdate(input)

      if (structure == null) return

      const updated = await prismaClient.structure.update({
        where: { id: structure.id },
        data: {
          ...structure,
          ...setModalitesAccesAuServiceFields(input),
          modification: new Date(),
        },
      })

      addMutationLog({
        userId: user.id,
        nom: 'ModifierStructure',
        duration: stopwatch.stop().duration,
        data: input,
      })

      return updated
    }),
  updateTypesDePublicsAccueillis: protectedProcedure
    .input(TypesDePublicsAccueillisValidation)
    .mutation(async ({ input, ctx: { user } }) => {
      const stopwatch = createStopwatch()
      const structure = await lieuActiviteToUpdate(input)

      if (structure == null) return

      const updated = await prismaClient.structure.update({
        where: { id: structure.id },
        data: {
          ...structure,
          ...setTypesDePublicsAccueillisFields(input),
          modification: new Date(),
        },
      })

      addMutationLog({
        userId: user.id,
        nom: 'ModifierStructure',
        duration: stopwatch.stop().duration,
        data: input,
      })

      return updated
    }),
  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(({ input: { query }, ctx: { user: sessionUser } }) => {
      enforceIsMediateur(sessionUser)

      return searchLieuxActivite({
        mediateurId: sessionUser.mediateur.id,
        searchParams: { recherche: query },
      })
    }),
})
