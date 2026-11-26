import { v4 } from 'uuid'
import { ParticipantsAnonymesCraCollectifData } from '@/features/activites/abilities/enregistrer-un-atelier-collectif/ui/forms/participants-anonymes-du-cra-collectif.validation'
import { beneficiairesDesParticipantsAnonymes } from '@/features/activites/fixtures/beneficiaires-des-participants-anonymes'
import type { Prisma, TypeLieu } from '@/generated/prisma/client'
import { mergeUuids } from '@/libraries/fixtures'

export const craIndividuel = <
  T extends Partial<Prisma.ActiviteUncheckedCreateInput> & {
    mediateurId: string
    beneficiaireId: string
    structureEmployeuseId: string
  },
>(
  data: T,
): {
  activite: Omit<T, 'id' | 'beneficiaireId' | 'structureEmployeuseId'> & {
    id: string
    duree: number
    type: 'Individuel'
    date: string | Date
    typeLieu: TypeLieu
  }
  employeuseCoopId: string
  accompagnements: Prisma.AccompagnementUncheckedCreateInput[]
} => {
  const { id, beneficiaireId, structureEmployeuseId, ...rest } = data

  const duree = rest.duree ?? 90
  const date = rest.date ?? new Date().toISOString()
  const typeLieu: TypeLieu = rest.typeLieu ?? 'ADistance'

  const givenId = id ?? v4()

  const activite = {
    ...rest,
    id: givenId,
    type: 'Individuel',
    duree,
    date,
    typeLieu,
  } satisfies Omit<T, 'id' | 'beneficiaireId' | 'structureEmployeuseId'> & {
    id: string
    duree: number
    date: string | Date
    typeLieu: TypeLieu
  }

  const accompagnements = [
    {
      id: givenId,
      beneficiaireId,
      activiteId: givenId,
    },
  ] satisfies Prisma.AccompagnementUncheckedCreateInput[]

  return {
    activite,
    employeuseCoopId: structureEmployeuseId,
    accompagnements,
  }
}

export const craDeDemarcheAdministrative = <
  T extends Partial<Prisma.ActiviteUncheckedCreateInput> & {
    mediateurId: string
    beneficiaireId: string
    structureEmployeuseId: string
  },
>(
  data: T,
): {
  activite: Omit<T, 'id' | 'beneficiaireId' | 'structureEmployeuseId'> & {
    id: string
    type: 'Individuel'
    duree: number
    date: string | Date
    typeLieu: TypeLieu
  }
  employeuseCoopId: string
  accompagnements: Prisma.AccompagnementUncheckedCreateInput[]
} => {
  const { id, beneficiaireId, structureEmployeuseId, ...rest } = data

  const duree = rest.duree ?? 90
  const date = rest.date ?? new Date().toISOString()
  const typeLieu: TypeLieu = rest.typeLieu ?? 'ADistance'

  const givenId = id ?? v4()

  const activite = {
    ...rest,
    id: givenId,
    type: 'Individuel',
    duree,
    date,
    typeLieu,
  } satisfies Omit<T, 'id' | 'beneficiaireId' | 'structureEmployeuseId'> & {
    id: string
    duree: number
    date: string | Date
    typeLieu: TypeLieu
  }

  const accompagnements = [
    {
      id: givenId,
      beneficiaireId,
      activiteId: givenId,
    },
  ] satisfies Prisma.AccompagnementUncheckedCreateInput[]

  return {
    activite,
    employeuseCoopId: structureEmployeuseId,
    accompagnements,
  }
}

export const craCollectif = <
  T extends Partial<Prisma.ActiviteUncheckedCreateInput> & {
    mediateurId: string
    beneficiaireIds: string[]
    participantsAnonymes: ParticipantsAnonymesCraCollectifData
    structureEmployeuseId: string
  },
>(
  data: T,
): {
  activite: Omit<
    T,
    'id' | 'participantsAnonymes' | 'beneficiaireIds' | 'structureEmployeuseId'
  > & {
    id: string
    type: 'Collectif'
    duree: number
    typeLieu: TypeLieu
    date: string | Date
  }
  employeuseCoopId: string
  accompagnements: Prisma.AccompagnementUncheckedCreateInput[]
  beneficiairesAnonymes: Prisma.BeneficiaireUncheckedCreateInput[]
} => {
  const {
    id,
    beneficiaireIds,
    participantsAnonymes,
    structureEmployeuseId,
    ...rest
  } = data

  const duree = rest.duree ?? 90
  const date = rest.date ?? new Date().toISOString()
  const typeLieu: TypeLieu = rest.typeLieu ?? 'ADistance'

  const givenId = id ?? v4()

  const accompagnements = beneficiaireIds.map(
    (beneficiaireId) =>
      ({
        id: mergeUuids(givenId, beneficiaireId),
        beneficiaireId,
        activiteId: givenId,
      }) satisfies Prisma.AccompagnementUncheckedCreateInput,
  )

  const beneficiairesAnonymes = beneficiairesDesParticipantsAnonymes({
    participantsAnonymes,
    rootUuid: givenId,
    mediateurId: rest.mediateurId,
  })

  for (const beneficiaireAnonyme of beneficiairesAnonymes) {
    accompagnements.push({
      id: mergeUuids(givenId, beneficiaireAnonyme.id),
      beneficiaireId: beneficiaireAnonyme.id,
      activiteId: givenId,
    })
  }

  const activite = {
    ...rest,
    id: givenId,
    type: 'Collectif',
    duree,
    date,
    typeLieu,
  } satisfies Omit<
    T,
    'id' | 'participantsAnonymes' | 'beneficiaireIds' | 'structureEmployeuseId'
  > & {
    id: string
  }

  return {
    activite,
    employeuseCoopId: structureEmployeuseId,
    accompagnements,
    beneficiairesAnonymes,
  }
}
