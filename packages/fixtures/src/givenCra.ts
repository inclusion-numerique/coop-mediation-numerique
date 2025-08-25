import { createBeneficiairesForParticipantsAnonymes } from '@app/web/beneficiaire/createBeneficiairesForParticipantsAnonymes'
import { ParticipantsAnonymesCraCollectifData } from '@app/web/features/activites/use-cases/cra/collectif/validation/ParticipantsAnonymesCraCollectifValidation'
import type { Prisma, TypeLieu } from '@prisma/client'
import { v4 } from 'uuid'
import { mergeUuids } from './mergeUuids'

/**
 * Create a CRA individuel prisma data with associated entities
 */
export const givenCraIndividuel = <
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
    accompagnementsCount: number
    structureEmployeuseId: string
  }
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
    accompagnementsCount: 1,
    structureEmployeuseId,
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
    accompagnements,
  }
}

/**
 * Create a CRA demarche prisma data with associated entities
 */
export const givenCraDemarcheAdministrative = <
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
    accompagnementsCount: number
    structureEmployeuseId: string
  }
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
    accompagnementsCount: 1,
    structureEmployeuseId,
  } satisfies Omit<T, 'id' | 'beneficiaireId' | 'structureEmployeuseId'> & {
    id: string
    duree: number
    date: string | Date
    typeLieu: TypeLieu
    structureEmployeuseId: string
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
    accompagnements,
  }
}

/**
 * Create a CRA collectif prisma data with associated entities
 */
export const givenCraCollectif = <
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
    accompagnementsCount: number
    structureEmployeuseId: string
  }
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

  // Create beneficiaires anonymes based on participantsAnonymes counters
  const beneficiairesAnonymes = createBeneficiairesForParticipantsAnonymes({
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
    accompagnementsCount: accompagnements.length,
    structureEmployeuseId,
  } satisfies Omit<
    T,
    'id' | 'participantsAnonymes' | 'beneficiaireIds' | 'structureEmployeuseId'
  > & {
    id: string
  }

  return {
    activite,
    accompagnements,
    beneficiairesAnonymes,
  }
}
