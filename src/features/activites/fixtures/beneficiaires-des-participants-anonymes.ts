import { v4 } from 'uuid'
import type { ParticipantsAnonymesCraCollectifData } from '@/features/activites/abilities/enregistrer-un-atelier-collectif/ui/forms/participants-anonymes-du-cra-collectif.validation'
import type {
  Genre,
  Prisma,
  StatutSocial,
  TrancheAge,
} from '@/generated/prisma/client'

const genres = [
  'Masculin',
  'Feminin',
  'NonCommunique',
] as const satisfies readonly Genre[]

const statutsSociaux = [
  'Retraite',
  'SansEmploi',
  'EnEmploi',
  'Scolarise',
  'NonCommunique',
] as const satisfies readonly StatutSocial[]

const tranchesAge = [
  'SoixanteDixPlus',
  'SoixanteSoixanteNeuf',
  'QuaranteCinquanteNeuf',
  'VingtCinqTrenteNeuf',
  'DixHuitVingtQuatre',
  'DouzeDixHuit',
  'MoinsDeDouze',
  'NonCommunique',
] as const satisfies readonly TrancheAge[]

export const compteurDUuid = (root: string, index: number): string =>
  root.slice(0, -5) + index.toString(10).padStart(5, '0')

export type CreatedBeneficiairesForParticipantsAnonymes =
  Prisma.BeneficiaireUncheckedCreateInput & {
    id: string
    mediateurId: string
    trancheAge: TrancheAge
    statutSocial: StatutSocial
    genre: Genre
    anonyme: true
    attributionsAleatoires: true
    dejaAccompagne: boolean
  }

const repartis = <V extends string>(
  valeurs: readonly V[],
  effectifDe: (valeur: V) => number,
): readonly V[] =>
  valeurs.flatMap((valeur) =>
    Array.from({ length: Math.max(effectifDe(valeur), 0) }, () => valeur),
  )

export const beneficiairesDesParticipantsAnonymes = ({
  participantsAnonymes,
  rootUuid = v4(),
  mediateurId,
}: {
  participantsAnonymes: ParticipantsAnonymesCraCollectifData
  rootUuid?: string
  mediateurId: string
}): CreatedBeneficiairesForParticipantsAnonymes[] => {
  const parGenre = repartis(
    genres,
    (genre) => participantsAnonymes[`genre${genre}`],
  )
  const parStatutSocial = repartis(
    statutsSociaux,
    (statutSocial) => participantsAnonymes[`statutSocial${statutSocial}`],
  )
  const parTrancheAge = repartis(
    tranchesAge,
    (trancheAge) => participantsAnonymes[`trancheAge${trancheAge}`],
  )

  return Array.from(
    { length: Math.max(participantsAnonymes.total, 0) },
    (_, index) => ({
      id: compteurDUuid(rootUuid, index),
      mediateurId,
      anonyme: true,
      attributionsAleatoires: true,
      trancheAge: parTrancheAge[index] ?? 'NonCommunique',
      statutSocial: parStatutSocial[index] ?? 'NonCommunique',
      genre: parGenre[index] ?? 'NonCommunique',
      dejaAccompagne: index < participantsAnonymes.dejaAccompagne,
    }),
  )
}
